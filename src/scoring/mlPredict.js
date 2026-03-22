import modelData from './model.json';

// Traverse a single decision tree
function predict_tree(tree, features) {
  let node = tree;
  while (!('p' in node)) {
    node = features[node.f] <= node.t ? node.l : node.r;
  }
  return node.p;
}

// Average across all trees → probability 0–1
function predict_proba(features) {
  const vals = modelData.features.map(f => features[f] || 0);
  const sum = modelData.trees.reduce((acc, t) => acc + predict_tree(t, vals), 0);
  return sum / modelData.trees.length;
}

// Derive the feature vector from PLUTO data (same as training)
function buildFeatures(pluto) {
  const far = pluto.lotarea > 0 ? pluto.bldgarea / pluto.lotarea : 0;
  return {
    numfloors: pluto.numfloors,
    lotarea: pluto.lotarea,
    bldgarea: pluto.bldgarea,
    yearbuilt: pluto.yearbuilt,
    far,
    is_office: pluto.bldgclass?.startsWith('O') ? 1 : 0,
    is_prewar: pluto.yearbuilt > 1900 && pluto.yearbuilt < 1945 ? 1 : 0,
    is_postwar_ideal: pluto.yearbuilt >= 1945 && pluto.yearbuilt <= 1980 ? 1 : 0,
    is_modern: pluto.yearbuilt > 2000 ? 1 : 0,
  };
}

// Top feature drivers for this prediction
function topDrivers(pluto) {
  const features = buildFeatures(pluto);
  const importances = modelData.feature_importances;
  const labels = {
    bldgarea: `Building area: ${pluto.bldgarea.toLocaleString()} sf`,
    lotarea: `Lot area: ${pluto.lotarea.toLocaleString()} sf`,
    yearbuilt: `Year built: ${pluto.yearbuilt}`,
    numfloors: `Floors: ${pluto.numfloors}`,
    far: `FAR: ${(features.far).toFixed(1)}`,
    is_office: features.is_office ? 'Office building class' : 'Non-office building class',
    is_prewar: features.is_prewar ? 'Pre-war construction (1900–1945)' : 'Not pre-war',
    is_postwar_ideal: features.is_postwar_ideal ? 'Post-war ideal era (1945–1980)' : 'Outside ideal era',
    is_modern: features.is_modern ? 'Modern construction (post-2000)' : 'Not modern',
  };
  return Object.entries(importances)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, weight]) => ({ feature: key, label: labels[key], weight }));
}

export function mlPredict(pluto) {
  const features = buildFeatures(pluto);
  const probability = predict_proba(features);
  const score = Math.round(probability * 100);

  let label;
  if (score >= 75) label = 'Viable';
  else if (score >= 50) label = 'Moderate Risk';
  else if (score >= 25) label = 'High Risk';
  else label = 'Likely Infeasible';

  return {
    score,
    probability: Math.round(probability * 1000) / 1000,
    label,
    drivers: topDrivers(pluto),
  };
}
