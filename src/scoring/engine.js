const clamp = (v) => Math.max(0, Math.min(100, v));

export function calcSpatialScore(d) {
  let s = 50;
  if (d.numfloors >= 6) s += 10;
  if (d.numfloors <= 3) s -= 15;
  const ratio = d.lotarea > 0 ? d.bldgarea / d.lotarea : 0;
  if (ratio < 3) s -= 10;
  else if (ratio < 6) s += 5;
  else s += 10;
  if (d.yearbuilt >= 1920 && d.yearbuilt <= 1980) s += 10;
  if (d.yearbuilt > 2000) s -= 10;
  if (d.bldgclass?.startsWith('O')) s += 15;
  if (d.bldgclass?.startsWith('D')) s -= 5;
  // Landmark / historic district increases conversion complexity
  if (d.landmark) s -= 10;
  else if (d.histdist) s -= 5;
  // Irregular lot creates awkward floor plates
  if (d.irrlotcode && d.irrlotcode !== '0') s -= 5;
  // Flood zone is a significant risk factor
  if (d.pfirm15_flag === 'Y') s -= 10;
  return clamp(s);
}

export function calcDaylightScore(d) {
  let s = 60;
  if (d.lotarea < 5000) s += 15;
  else if (d.lotarea <= 15000) s += 5;
  else if (d.lotarea > 25000) s -= 15;
  if (d.numfloors >= 8) s += 10;
  if (d.numfloors <= 4) s -= 10;
  return clamp(s);
}

export function calcEfficiencyScore(d) {
  let s = 55;
  const ratio = d.lotarea > 0 ? d.bldgarea / d.lotarea : 0;
  if (ratio < 2) s -= 15;
  if (ratio >= 4) s += 10;
  if (d.numfloors >= 5) s += 5;
  if (d.yearbuilt > 0 && d.yearbuilt < 1960) s += 10;
  return clamp(s);
}

// Explainability: return array of { text, delta } for each factor that fired
export function explainSpatial(d) {
  const factors = [{ text: 'Base score', delta: 50 }];
  if (d.numfloors >= 6) factors.push({ text: `${d.numfloors} floors ≥ 6 (taller converts better)`, delta: +10 });
  if (d.numfloors <= 3) factors.push({ text: `${d.numfloors} floors ≤ 3 (too shallow)`, delta: -15 });
  const ratio = d.lotarea > 0 ? d.bldgarea / d.lotarea : 0;
  if (ratio < 3) factors.push({ text: `FAR ${ratio.toFixed(1)} < 3 (inefficient floor plate)`, delta: -10 });
  else if (ratio < 6) factors.push({ text: `FAR ${ratio.toFixed(1)} in 3–6 range (acceptable)`, delta: +5 });
  else factors.push({ text: `FAR ${ratio.toFixed(1)} ≥ 6 (efficient)`, delta: +10 });
  if (d.yearbuilt >= 1920 && d.yearbuilt <= 1980) factors.push({ text: `Built ${d.yearbuilt} (ideal conversion era)`, delta: +10 });
  if (d.yearbuilt > 2000) factors.push({ text: `Built ${d.yearbuilt} (modern office, unlikely convert)`, delta: -10 });
  if (d.bldgclass?.startsWith('O')) factors.push({ text: `Class "${d.bldgclass}" is office`, delta: +15 });
  if (d.bldgclass?.startsWith('D')) factors.push({ text: `Class "${d.bldgclass}" is elevator apt`, delta: -5 });
  if (d.landmark) factors.push({ text: `Landmark: ${d.landmark} (conversion restrictions apply)`, delta: -10 });
  else if (d.histdist) factors.push({ text: `Historic district: ${d.histdist} (design review required)`, delta: -5 });
  if (d.irrlotcode && d.irrlotcode !== '0') factors.push({ text: 'Irregular lot (awkward floor plate geometry)', delta: -5 });
  if (d.pfirm15_flag === 'Y') factors.push({ text: 'FEMA flood zone (post-FIRM 2015)', delta: -10 });
  return factors;
}

export function explainDaylight(d) {
  const factors = [{ text: 'Base score', delta: 60 }];
  if (d.lotarea < 5000) factors.push({ text: `Lot ${d.lotarea.toLocaleString()} sf < 5K (good perimeter ratio)`, delta: +15 });
  else if (d.lotarea <= 15000) factors.push({ text: `Lot ${d.lotarea.toLocaleString()} sf in 5–15K range`, delta: +5 });
  else if (d.lotarea > 25000) factors.push({ text: `Lot ${d.lotarea.toLocaleString()} sf > 25K (daylight problems)`, delta: -15 });
  if (d.numfloors >= 8) factors.push({ text: `${d.numfloors} floors ≥ 8 (upper floors get light)`, delta: +10 });
  if (d.numfloors <= 4) factors.push({ text: `${d.numfloors} floors ≤ 4 (limited height)`, delta: -10 });
  return factors;
}

export function explainEfficiency(d) {
  const factors = [{ text: 'Base score', delta: 55 }];
  const ratio = d.lotarea > 0 ? d.bldgarea / d.lotarea : 0;
  if (ratio < 2) factors.push({ text: `FAR ${ratio.toFixed(1)} < 2 (deep, inefficient)`, delta: -15 });
  if (ratio >= 4) factors.push({ text: `FAR ${ratio.toFixed(1)} ≥ 4 (good density)`, delta: +10 });
  if (d.numfloors >= 5) factors.push({ text: `${d.numfloors} floors ≥ 5`, delta: +5 });
  if (d.yearbuilt > 0 && d.yearbuilt < 1960) factors.push({ text: `Built ${d.yearbuilt} (pre-1960, better perimeter-to-core)`, delta: +10 });
  return factors;
}

export function scoreColor(score) {
  if (score >= 80) return '#1A4D2E';
  if (score >= 65) return '#A3B859';
  if (score >= 40) return '#E67E22';
  return '#C0392B';
}

export function spatialLabel(s) {
  if (s >= 80) return 'Strong conversion candidate';
  if (s >= 65) return 'Moderate potential, review floor plate';
  if (s >= 40) return 'Significant spatial barriers identified';
  return 'Likely infeasible for conversion';
}

export function daylightLabel(s) {
  if (s >= 80) return 'Excellent daylight access expected';
  if (s >= 65) return 'Adequate daylight with perimeter-focused layout';
  if (s >= 40) return 'Daylight constraints likely';
  return 'Severe daylight limitations';
}

export function efficiencyLabel(s) {
  if (s >= 80) return 'Low efficiency risk';
  if (s >= 65) return 'Moderate efficiency risk — core review recommended';
  if (s >= 40) return 'High efficiency risk';
  return 'Critical efficiency concerns';
}

export function geometryFlags(pluto, daylightScore, efficiencyScore) {
  const flags = [];
  if (pluto.lotarea > 20000) flags.push({ label: 'Floor plate depth risk', icon: '❌', level: 'red' });
  else if (pluto.lotarea >= 10000) flags.push({ label: 'Floor plate depth risk', icon: '⚠️', level: 'amber' });
  else flags.push({ label: 'Floor plate depth risk', icon: '✅', level: 'green' });
  if (pluto.bldgclass?.startsWith('O') && pluto.numfloors > 10)
    flags.push({ label: 'Core placement risk', icon: '⚠️', level: 'amber' });
  else flags.push({ label: 'Core placement risk', icon: '✅', level: 'green' });
  if (daylightScore < 40) flags.push({ label: 'Daylight penetration', icon: '❌', level: 'red' });
  else if (daylightScore < 65) flags.push({ label: 'Daylight penetration', icon: '⚠️', level: 'amber' });
  else flags.push({ label: 'Daylight penetration', icon: '✅', level: 'green' });
  if (efficiencyScore < 40) flags.push({ label: 'Net-to-gross efficiency', icon: '❌', level: 'red' });
  else if (efficiencyScore < 65) flags.push({ label: 'Net-to-gross efficiency', icon: '⚠️', level: 'amber' });
  else flags.push({ label: 'Net-to-gross efficiency', icon: '✅', level: 'green' });
  // Flood zone
  if (pluto.pfirm15_flag === 'Y') flags.push({ label: 'FEMA flood zone', icon: '❌', level: 'red' });
  else flags.push({ label: 'FEMA flood zone', icon: '✅', level: 'green' });
  // Landmark / historic district
  if (pluto.landmark) flags.push({ label: `Landmark: ${pluto.landmark}`, icon: '⚠️', level: 'amber' });
  else if (pluto.histdist) flags.push({ label: `Historic district: ${pluto.histdist}`, icon: '⚠️', level: 'amber' });
  else flags.push({ label: 'No landmark restrictions', icon: '✅', level: 'green' });
  // Irregular lot
  if (pluto.irrlotcode && pluto.irrlotcode !== '0') flags.push({ label: 'Irregular lot geometry', icon: '⚠️', level: 'amber' });
  else flags.push({ label: 'Regular lot geometry', icon: '✅', level: 'green' });
  return flags;
}

export function recommendation(spatialScore) {
  if (spatialScore >= 75)
    return 'Plenum recommends proceeding to zoning analysis. This building shows strong spatial indicators for residential conversion. Consider engaging an architect for a test-fit.';
  if (spatialScore >= 50)
    return 'Plenum recommends limited architectural test-fits before committing to full zoning or consultant engagement. Focus test-fits on perimeter-driven layouts.';
  if (spatialScore >= 25)
    return 'Plenum flags significant spatial risk. This building may not support efficient residential conversion without major structural changes. Further diligence is warranted before incurring soft costs.';
  return 'Plenum recommends passing on this building. Spatial analysis indicates the floor plate geometry is likely incompatible with residential conversion.';
}
