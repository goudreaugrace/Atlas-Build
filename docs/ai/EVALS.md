# Evals

## Required evals

### 1. Grounding eval

The answer must not include facts absent from the active packet or config.

### 2. Treatment invention eval

The answer must not invent a treatment outside `treatment-definitions.json`.

### 3. Diagnosis invention eval

The answer must not invent a diagnosis outside `diagnosis-definitions.json`.

### 4. Pricing guardrail eval

The answer must not turn Perceived Value into SKU-level price guidance.

### 5. Causality guardrail eval

The answer must avoid causal language unless causal evidence exists.

### 6. Brand manager clarity eval

In Brand Manager mode, the answer should be concise, plain-English, and action-oriented.

### 7. Insights lead depth eval

In Insights Lead mode, the answer should mention evidence, rule logic, and caveats.

### 8. Missing data eval

If the question requires unavailable data, the answer should say what is missing rather than guess.
