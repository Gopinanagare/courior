import db from "./db";

export interface RateCalculationInput {
  serviceCode: string; // standard, cargo, cold, intl, hyper
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValue?: number;
  originPincode?: string;
  destinationPincode?: string;
  paymentMode?: "prepaid" | "cod" | "to_pay";
  codAmount?: number;
}

export interface RateCalculationResult {
  serviceCode: string;
  serviceName: string;
  actualWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  baseFreight: number;
  weightSurcharge: number;
  fuelSurcharge: number;
  insuranceFee: number;
  codFee: number;
  taxGst: number;
  totalAmount: number;
  transitTimeLabel: string;
  isServiceable: boolean;
  distanceZoneLabel: string;
}

export function calculateShippingRate(input: RateCalculationInput): RateCalculationResult {
  const {
    serviceCode,
    actualWeightKg,
    lengthCm,
    widthCm,
    heightCm,
    declaredValue = 0,
    originPincode,
    destinationPincode,
    paymentMode = "prepaid",
    codAmount = 0,
  } = input;

  // 1. Fetch courier service config
  const service = db.prepare("SELECT * FROM courier_services WHERE code = ? AND is_active = 1").get(serviceCode) as any;
  if (!service) {
    throw new Error(`Courier service '${serviceCode}' not found or inactive.`);
  }

  // 2. Fetch rate rules
  const rules = db.prepare("SELECT * FROM rate_rules ORDER BY id DESC LIMIT 1").get() as any || {
    fuel_surcharge_pct: 4.2,
    insurance_pct: 0.5,
    min_insurance_fee: 260.30,
    gst_pct: 18.0,
    cod_fixed_fee: 50.0,
    cod_pct: 1.5,
  };

  // 3. Volumetric Weight Calculation
  const divisor = service.volumetric_divisor || 5000;
  const volumetricWeightKg = Number(((lengthCm * widthCm * heightCm) / divisor).toFixed(2));
  const chargeableWeightKg = Math.max(actualWeightKg, volumetricWeightKg, service.min_weight_kg || 0.5);

  // 4. Zone & Distance Factor
  let zoneMultiplier = 1.0;
  let distanceZoneLabel = "Intra-State / Standard Corridor";

  if (originPincode && destinationPincode) {
    const orig = db.prepare("SELECT * FROM pincodes WHERE pincode = ?").get(originPincode) as any;
    const dest = db.prepare("SELECT * FROM pincodes WHERE pincode = ?").get(destinationPincode) as any;

    if (orig && dest) {
      if (orig.zone !== dest.zone) {
        zoneMultiplier = 1.25; // Inter-zone linehaul
        distanceZoneLabel = `Inter-Zone (${orig.zone} → ${dest.zone})`;
      } else if (orig.city !== dest.city) {
        zoneMultiplier = 1.1; // Same zone, different city
        distanceZoneLabel = `Intra-Zone Inter-City (${orig.city} → ${dest.city})`;
      } else {
        zoneMultiplier = 0.9; // Hyperlocal / Intra-city
        distanceZoneLabel = `Intra-City Local (${orig.city})`;
      }
    }
  }

  // 5. Freight computation
  // Base cost + weight slab cost
  let baseMultiplier = 14;
  if (serviceCode === "cargo") baseMultiplier = 18;
  if (serviceCode === "cold") baseMultiplier = 30;
  if (serviceCode === "intl") baseMultiplier = 45;

  const baseFreight = Number((service.base_rate * zoneMultiplier + (chargeableWeightKg * baseMultiplier * 0.4)).toFixed(2));
  const weightSurcharge = Number((chargeableWeightKg * service.per_kg_rate).toFixed(2));

  // Fuel Surcharge (FSC)
  const fuelSurcharge = Number(((baseFreight + weightSurcharge) * (rules.fuel_surcharge_pct / 100)).toFixed(2));

  // Insurance Fee
  let insuranceFee = 0;
  if (declaredValue > 0) {
    const valPctFee = (declaredValue * (rules.insurance_pct / 100));
    insuranceFee = Number(Math.max(rules.min_insurance_fee, valPctFee).toFixed(2));
  } else {
    insuranceFee = rules.min_insurance_fee; // Base coverage
  }

  // COD Fee
  let codFee = 0;
  if (paymentMode === "cod" && codAmount > 0) {
    codFee = Number((rules.cod_fixed_fee + (codAmount * (rules.cod_pct / 100))).toFixed(2));
  }

  // Subtotal before tax
  const subtotal = baseFreight + weightSurcharge + fuelSurcharge + insuranceFee + codFee;
  const taxGst = Number((subtotal * (rules.gst_pct / 100)).toFixed(2));
  const totalAmount = Number((subtotal + taxGst).toFixed(2));

  return {
    serviceCode: service.code,
    serviceName: service.name,
    actualWeightKg,
    volumetricWeightKg,
    chargeableWeightKg,
    baseFreight,
    weightSurcharge,
    fuelSurcharge,
    insuranceFee,
    codFee,
    taxGst,
    totalAmount,
    transitTimeLabel: service.transit_time_label,
    isServiceable: true,
    distanceZoneLabel,
  };
}

export function generateAwbNumber(): string {
  // Pattern: EXL-XXXXXXX-IN (7 digits random or timestamp based)
  const random7 = Math.floor(1000000 + Math.random() * 9000000);
  return `EXL-${random7}-IN`;
}

export function generateInvoiceNumber(): string {
  const random5 = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `INV-${year}-${random5}`;
}

export function generateTicketNumber(): string {
  const random5 = Math.floor(10000 + Math.random() * 90000);
  return `TKT-${random5}`;
}
