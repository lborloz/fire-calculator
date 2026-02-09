/**
 * URL state management - encode/decode scenarios to query params
 */

import { RetirementInputs } from "./types";

/**
 * Encode inputs to URL query string
 */
export function encodeInputsToUrl(inputs: RetirementInputs): string {
  const params = new URLSearchParams();

  params.set("age", inputs.currentAge.toString());
  params.set("initial", inputs.initialInvestment.toString());
  params.set("spend", inputs.monthlyRetirementSpend.toString());
  params.set("return", inputs.expectedYearlyReturn.toString());
  params.set("inflation", inputs.inflationRate.toString());
  params.set("compound", inputs.compoundingInterval);
  params.set("swr", inputs.safeWithdrawalRate.toString());
  params.set("buffer", inputs.retirementBufferMultiplier.toString());
  params.set("mode", inputs.inflationMode);

  // Encode phases as JSON
  params.set("phases", JSON.stringify(inputs.contributionPhases));

  return params.toString();
}

/**
 * Decode inputs from URL query string
 */
export function decodeInputsFromUrl(
  searchParams: URLSearchParams,
  defaultInputs: RetirementInputs
): RetirementInputs {
  try {
    const inputs: RetirementInputs = { ...defaultInputs };

    if (searchParams.has("age")) {
      inputs.currentAge = parseFloat(searchParams.get("age")!);
    }
    if (searchParams.has("initial")) {
      inputs.initialInvestment = parseFloat(searchParams.get("initial")!);
    }
    if (searchParams.has("spend")) {
      inputs.monthlyRetirementSpend = parseFloat(searchParams.get("spend")!);
    }
    if (searchParams.has("return")) {
      inputs.expectedYearlyReturn = parseFloat(searchParams.get("return")!);
    }
    if (searchParams.has("inflation")) {
      inputs.inflationRate = parseFloat(searchParams.get("inflation")!);
    }
    if (searchParams.has("compound")) {
      const compound = searchParams.get("compound");
      if (compound === "monthly" || compound === "yearly") {
        inputs.compoundingInterval = compound;
      }
    }
    if (searchParams.has("swr")) {
      inputs.safeWithdrawalRate = parseFloat(searchParams.get("swr")!);
    }
    if (searchParams.has("buffer")) {
      inputs.retirementBufferMultiplier = parseFloat(
        searchParams.get("buffer")!
      );
    }
    if (searchParams.has("mode")) {
      const mode = searchParams.get("mode");
      if (mode === "nominal" || mode === "real") {
        inputs.inflationMode = mode;
      }
    }
    if (searchParams.has("phases")) {
      inputs.contributionPhases = JSON.parse(searchParams.get("phases")!);
    }

    return inputs;
  } catch (error) {
    console.error("Error decoding URL params:", error);
    return defaultInputs;
  }
}
