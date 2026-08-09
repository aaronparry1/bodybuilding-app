# Mesocycle Certification

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "cases": [
    {
      "id": "hypertrophy_calibration",
      "engine": "hypertrophy",
      "adaptation": "Establish reproducible exercise, load and recovery baselines",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 2,
      "maximumWeeks": 3,
      "primaryStimulus": "Conservative stable training",
      "maintenanceStimuli": [
        "Technique",
        "joint tolerance"
      ],
      "successCriteria": [
        "Credible baselines"
      ],
      "exitCriteria": [
        "Main movement and muscle data exists"
      ],
      "failureRoute": "Replace unsuitable exercise or reduce complexity",
      "nextStates": [
        "hypertrophy_base"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "hypertrophy_calibration",
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "primaryAdaptation": "Conservative stable training",
        "retainedQualities": [
          "Technique",
          "joint tolerance"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": true
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_calibration",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "high",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:hypertrophy_calibration:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Main movement and muscle data exists"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Credible baselines"
          ],
          "exitRequirements": [
            "Main movement and muscle data exists"
          ],
          "approvedSuccessors": [
            "hypertrophy_base"
          ]
        }
      }
    },
    {
      "id": "hypertrophy_base",
      "engine": "hypertrophy",
      "adaptation": "Build recoverable muscle stimulus",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 3,
      "defaultWeeks": 6,
      "maximumWeeks": 10,
      "primaryStimulus": "Stable progressive muscle-specific work",
      "maintenanceStimuli": [
        "Strength",
        "joint tolerance"
      ],
      "successCriteria": [
        "Priority-muscle rep/load progression"
      ],
      "exitCriteria": [
        "Broad slowing, fatigue or duration limit"
      ],
      "failureRoute": "Consolidate or adjust local muscle dose",
      "nextStates": [
        "hypertrophy_volume",
        "hypertrophy_specialisation",
        "hypertrophy_consolidation"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "hypertrophy_base",
        "purpose": "Build recoverable muscle stimulus",
        "primaryAdaptation": "Stable progressive muscle-specific work",
        "retainedQualities": [
          "Strength",
          "joint tolerance"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": true
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_base",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "high",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "amrap"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:hypertrophy_base:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Broad slowing, fatigue or duration limit"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Priority-muscle rep/load progression"
          ],
          "exitRequirements": [
            "Broad slowing, fatigue or duration limit"
          ],
          "approvedSuccessors": [
            "hypertrophy_volume",
            "hypertrophy_specialisation",
            "hypertrophy_consolidation"
          ]
        }
      }
    },
    {
      "id": "hypertrophy_volume",
      "engine": "hypertrophy",
      "adaptation": "Find productive additional volume for selected muscles",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 3,
      "defaultWeeks": 4,
      "maximumWeeks": 8,
      "primaryStimulus": "Small local volume increases",
      "maintenanceStimuli": [
        "Other muscles",
        "recovery"
      ],
      "successCriteria": [
        "Improved target response"
      ],
      "exitCriteria": [
        "Dose identified or recovery ceiling"
      ],
      "failureRoute": "Return to prior dose",
      "nextStates": [
        "hypertrophy_consolidation"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "hypertrophy_volume",
        "purpose": "Find productive additional volume for selected muscles",
        "primaryAdaptation": "Small local volume increases",
        "retainedQualities": [
          "Other muscles",
          "recovery"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": true
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_volume",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "high",
          "progression": "adaptive",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "amrap",
            "antagonist_superset",
            "rest_pause",
            "eight_across"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:hypertrophy_volume:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Dose identified or recovery ceiling"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Improved target response"
          ],
          "exitRequirements": [
            "Dose identified or recovery ceiling"
          ],
          "approvedSuccessors": [
            "hypertrophy_consolidation"
          ]
        }
      }
    },
    {
      "id": "hypertrophy_specialisation",
      "engine": "hypertrophy",
      "adaptation": "Prioritise one to three muscles",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 4,
      "defaultWeeks": 6,
      "maximumWeeks": 10,
      "primaryStimulus": "Priority-muscle volume and placement",
      "maintenanceStimuli": [
        "Non-priority muscle"
      ],
      "successCriteria": [
        "Priority development without unacceptable regression"
      ],
      "exitCriteria": [
        "Target reached, stall or fatigue"
      ],
      "failureRoute": "Reassess exercise fit and dose",
      "nextStates": [
        "hypertrophy_consolidation"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "hypertrophy_specialisation",
        "purpose": "Prioritise one to three muscles",
        "primaryAdaptation": "Priority-muscle volume and placement",
        "retainedQualities": [
          "Non-priority muscle"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": true
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_specialisation",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "high",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "amrap",
            "antagonist_superset",
            "rest_pause",
            "eight_across"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:hypertrophy_specialisation:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Target reached, stall or fatigue"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Priority development without unacceptable regression"
          ],
          "exitRequirements": [
            "Target reached, stall or fatigue"
          ],
          "approvedSuccessors": [
            "hypertrophy_consolidation"
          ]
        }
      }
    },
    {
      "id": "hypertrophy_consolidation",
      "engine": "hypertrophy",
      "adaptation": "Dissipate fatigue while retaining muscle",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 2,
      "defaultWeeks": 3,
      "maximumWeeks": 5,
      "primaryStimulus": "Maintenance volume and familiar work",
      "maintenanceStimuli": [
        "Strength"
      ],
      "successCriteria": [
        "Performance rebound"
      ],
      "exitCriteria": [
        "Recovery normalises"
      ],
      "failureRoute": "Transition",
      "nextStates": [
        "hypertrophy_base",
        "hypertrophy_transition"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "hypertrophy_consolidation",
        "purpose": "Dissipate fatigue while retaining muscle",
        "primaryAdaptation": "Maintenance volume and familiar work",
        "retainedQualities": [
          "Strength"
        ],
        "prohibitedEmphases": [
          "maximal accumulation",
          "failure chasing"
        ],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "recovery",
            "hypertrophy"
          ],
          "prohibited": [
            "expression",
            "power"
          ],
          "preferred": "recovery",
          "readinessRestriction": "recovery_first"
        },
        "concreteLanes": {
          "allowed": [
            "recovery",
            "maintenance"
          ],
          "prohibited": [
            "power",
            "peak",
            "strength"
          ],
          "required": "recovery",
          "preferredByRole": {
            "primary": "recovery",
            "secondary": "recovery",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "maintenance"
            ],
            "secondary": [
              "maintenance"
            ],
            "accessory": [
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "fatigue_reduction",
            "rep_region"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_consolidation",
                "role:primary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_consolidation",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_consolidation",
                "role:secondary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_consolidation",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "recovery": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_consolidation",
                "role:accessory",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_consolidation",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "low",
          "progression": "reduce",
          "recoveryAdjustment": "required"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets"
          ],
          "prohibited": [
            "amrap",
            "dynamic_effort",
            "max_effort",
            "heavy_single_triple_five_backoffs",
            "bbb"
          ],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "deload",
          "fatiguePenalty": "high",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "recovery",
          "status": "required",
          "thresholdPolicyId": "mesocycle:hypertrophy_consolidation:dropoff:v1",
          "response": "reduce",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "recovery_first",
          "monitoring": "recovery",
          "stopPolicy": "reduce"
        },
        "specialState": "deload",
        "progression": {
          "permitted": [
            "fatigue_reduction"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Recovery normalises"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Performance rebound"
          ],
          "exitRequirements": [
            "Recovery normalises"
          ],
          "approvedSuccessors": [
            "hypertrophy_base",
            "hypertrophy_transition"
          ]
        }
      }
    },
    {
      "id": "hypertrophy_transition",
      "engine": "hypertrophy",
      "adaptation": "Restore readiness",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 1,
      "maximumWeeks": 2,
      "primaryStimulus": "Low structured volume",
      "maintenanceStimuli": [],
      "successCriteria": [
        "Readiness restored"
      ],
      "exitCriteria": [
        "Next goal selected"
      ],
      "failureRoute": "Continue low stress briefly",
      "nextStates": [
        "hypertrophy_base"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "hypertrophy_transition",
        "purpose": "Restore readiness",
        "primaryAdaptation": "Low structured volume",
        "retainedQualities": [],
        "prohibitedEmphases": [
          "maximal accumulation",
          "failure chasing"
        ],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "recovery",
            "hypertrophy"
          ],
          "prohibited": [
            "expression",
            "power"
          ],
          "preferred": "recovery",
          "readinessRestriction": "recovery_first"
        },
        "concreteLanes": {
          "allowed": [
            "recovery",
            "maintenance"
          ],
          "prohibited": [
            "power",
            "peak",
            "strength"
          ],
          "required": "recovery",
          "preferredByRole": {
            "primary": "recovery",
            "secondary": "recovery",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "maintenance"
            ],
            "secondary": [
              "maintenance"
            ],
            "accessory": [
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "fatigue_reduction",
            "rep_region"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_transition",
                "role:primary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_transition",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_transition",
                "role:secondary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_transition",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "recovery": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_transition",
                "role:accessory",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
              "provenance": [
                "mesocycle:hypertrophy_transition",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "low",
          "progression": "reduce",
          "recoveryAdjustment": "required"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets"
          ],
          "prohibited": [
            "amrap",
            "dynamic_effort",
            "max_effort",
            "heavy_single_triple_five_backoffs",
            "bbb"
          ],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "deload",
          "fatiguePenalty": "high",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "recovery",
          "status": "required",
          "thresholdPolicyId": "mesocycle:hypertrophy_transition:dropoff:v1",
          "response": "reduce",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "recovery_first",
          "monitoring": "recovery",
          "stopPolicy": "reduce"
        },
        "specialState": "deload",
        "progression": {
          "permitted": [
            "fatigue_reduction"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Next goal selected"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Readiness restored"
          ],
          "exitRequirements": [
            "Next goal selected"
          ],
          "approvedSuccessors": [
            "hypertrophy_base"
          ]
        }
      }
    },
    {
      "id": "powerbuilding_foundation",
      "engine": "powerbuilding",
      "adaptation": "Establish repeatable squat, bench and deadlift",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 2,
      "defaultWeeks": 3,
      "maximumWeeks": 8,
      "primaryStimulus": "Submaximal main-lift practice",
      "maintenanceStimuli": [
        "General hypertrophy"
      ],
      "successCriteria": [
        "Stable technique"
      ],
      "exitCriteria": [
        "Progressive loading is stable"
      ],
      "failureRoute": "Reduce complexity",
      "nextStates": [
        "powerbuilding_hypertrophy"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "powerbuilding_foundation",
        "purpose": "Establish repeatable squat, bench and deadlift",
        "primaryAdaptation": "Submaximal main-lift practice",
        "retainedQualities": [
          "General hypertrophy"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": true
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_foundation",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:powerbuilding_foundation:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Progressive loading is stable"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Stable technique"
          ],
          "exitRequirements": [
            "Progressive loading is stable"
          ],
          "approvedSuccessors": [
            "powerbuilding_hypertrophy"
          ]
        }
      }
    },
    {
      "id": "powerbuilding_hypertrophy",
      "engine": "powerbuilding",
      "adaptation": "Add muscle while retaining S/B/D",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 4,
      "defaultWeeks": 6,
      "maximumWeeks": 10,
      "primaryStimulus": "High assistance allocation with regular main lifts",
      "maintenanceStimuli": [
        "S/B/D skill"
      ],
      "successCriteria": [
        "Assistance progress and maintained lifts"
      ],
      "exitCriteria": [
        "Development achieved or fatigue"
      ],
      "failureRoute": "Consolidate",
      "nextStates": [
        "powerbuilding_strength"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "powerbuilding_hypertrophy",
        "purpose": "Add muscle while retaining S/B/D",
        "primaryAdaptation": "High assistance allocation with regular main lifts",
        "retainedQualities": [
          "S/B/D skill"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": true
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": true,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_hypertrophy",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "high",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "amrap",
            "antagonist_superset",
            "rest_pause",
            "eight_across",
            "bbb"
          ],
          "prohibited": [],
          "conditional": [
            "bbb"
          ]
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:powerbuilding_hypertrophy:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Development achieved or fatigue"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Assistance progress and maintained lifts"
          ],
          "exitRequirements": [
            "Development achieved or fatigue"
          ],
          "approvedSuccessors": [
            "powerbuilding_strength"
          ]
        }
      }
    },
    {
      "id": "powerbuilding_strength",
      "engine": "powerbuilding",
      "adaptation": "Convert capacity into stronger main lifts",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 4,
      "defaultWeeks": 5,
      "maximumWeeks": 8,
      "primaryStimulus": "Submaximal lift-specific volume",
      "maintenanceStimuli": [
        "Muscle"
      ],
      "successCriteria": [
        "Improving estimated strength"
      ],
      "exitCriteria": [
        "Testing, fatigue or maximum"
      ],
      "failureRoute": "Return to hypertrophy bias",
      "nextStates": [
        "powerbuilding_intensification",
        "powerbuilding_hypertrophy"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "powerbuilding_strength",
        "purpose": "Convert capacity into stronger main lifts",
        "primaryAdaptation": "Submaximal lift-specific volume",
        "retainedQualities": [
          "Muscle"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "hypertrophy_strength",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_strength",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "heavy_single_triple_five_backoffs",
            "five_three_one",
            "ladder"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:powerbuilding_strength:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Testing, fatigue or maximum"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Improving estimated strength"
          ],
          "exitRequirements": [
            "Testing, fatigue or maximum"
          ],
          "approvedSuccessors": [
            "powerbuilding_intensification",
            "powerbuilding_hypertrophy"
          ]
        }
      }
    },
    {
      "id": "powerbuilding_intensification",
      "engine": "powerbuilding",
      "adaptation": "Heavy main-lift expression",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 3,
      "defaultWeeks": 4,
      "maximumWeeks": 6,
      "primaryStimulus": "High-specificity heavy work",
      "maintenanceStimuli": [
        "Low-cost muscle work"
      ],
      "successCriteria": [
        "Stable heavy performance"
      ],
      "exitCriteria": [
        "Ready to test or fatigue"
      ],
      "failureRoute": "Consolidate",
      "nextStates": [
        "powerbuilding_realisation",
        "powerbuilding_transition"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "powerbuilding_intensification",
        "purpose": "Heavy main-lift expression",
        "primaryAdaptation": "High-specificity heavy work",
        "retainedQualities": [
          "Low-cost muscle work"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "high",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 1,
          "maximumRepTarget": 12,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_intensification",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "high",
          "technicalComplexity": "high",
          "specificity": "specific",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "moderate",
          "specificityBonus": "moderate",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "specific",
          "loadability": "required",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "required",
          "thresholdPolicyId": "mesocycle:powerbuilding_intensification:dropoff:v1",
          "response": "stop",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "tight",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Ready to test or fatigue"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Stable heavy performance"
          ],
          "exitRequirements": [
            "Ready to test or fatigue"
          ],
          "approvedSuccessors": [
            "powerbuilding_realisation",
            "powerbuilding_transition"
          ]
        }
      }
    },
    {
      "id": "powerbuilding_realisation",
      "engine": "powerbuilding",
      "adaptation": "Express strength",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 2,
      "maximumWeeks": 2,
      "primaryStimulus": "Low-volume familiar main lifts",
      "maintenanceStimuli": [],
      "successCriteria": [
        "Best available test performance"
      ],
      "exitCriteria": [
        "Test complete"
      ],
      "failureRoute": "Transition",
      "nextStates": [
        "powerbuilding_transition"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "powerbuilding_realisation",
        "purpose": "Express strength",
        "primaryAdaptation": "Low-volume familiar main lifts",
        "retainedQualities": [],
        "prohibitedEmphases": [
          "high fatigue accumulation"
        ],
        "loading": {
          "character": "very_high",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "expression",
            "strength"
          ],
          "prohibited": [],
          "preferred": "expression",
          "readinessRestriction": "expression_only"
        },
        "concreteLanes": {
          "allowed": [
            "peak",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "peak",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [
            "peak"
          ],
          "establishedLoadRequired": [
            "peak"
          ]
        },
        "targets": {
          "modes": [
            "expression",
            "established_load"
          ],
          "minimumRepTarget": 1,
          "maximumRepTarget": 12,
          "establishedLoadRequired": true,
          "backOffPermitted": false,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "peak": {
              "minReps": 1,
              "maxReps": 5,
              "preferredBias": "lower",
              "loadingMode": "expression",
              "establishedLoad": "preferred",
              "backOffPermitted": false,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:primary",
                "lane:peak"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "peak": {
              "minReps": 4,
              "maxReps": 5,
              "preferredBias": "lower",
              "loadingMode": "expression",
              "establishedLoad": "preferred",
              "backOffPermitted": false,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:secondary",
                "lane:peak"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "peak": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "expression",
              "establishedLoad": "preferred",
              "backOffPermitted": false,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:accessory",
                "lane:peak"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_realisation",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "heavy_single_triple_five_backoffs"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "stability": "high",
          "technicalComplexity": "high",
          "specificity": "specific",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "peak",
          "fatiguePenalty": "moderate",
          "specificityBonus": "high",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "specific",
          "loadability": "required",
          "calibrationRequired": true
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "required",
          "thresholdPolicyId": "mesocycle:powerbuilding_realisation:dropoff:v1",
          "response": "stop",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "very_tight",
          "monitoring": "rep",
          "stopPolicy": "stop"
        },
        "specialState": "peak",
        "progression": {
          "permitted": [
            "expression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Test complete"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Best available test performance"
          ],
          "exitRequirements": [
            "Test complete"
          ],
          "approvedSuccessors": [
            "powerbuilding_transition"
          ]
        }
      }
    },
    {
      "id": "powerbuilding_transition",
      "engine": "powerbuilding",
      "adaptation": "Recover after expression",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 1,
      "maximumWeeks": 2,
      "primaryStimulus": "Low fatigue",
      "maintenanceStimuli": [],
      "successCriteria": [
        "Readiness restored"
      ],
      "exitCriteria": [
        "Next cycle chosen"
      ],
      "failureRoute": "Extend briefly",
      "nextStates": [
        "powerbuilding_hypertrophy"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "powerbuilding_transition",
        "purpose": "Recover after expression",
        "primaryAdaptation": "Low fatigue",
        "retainedQualities": [],
        "prohibitedEmphases": [
          "maximal accumulation",
          "failure chasing"
        ],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "recovery",
            "hypertrophy"
          ],
          "prohibited": [
            "expression",
            "power"
          ],
          "preferred": "recovery",
          "readinessRestriction": "recovery_first"
        },
        "concreteLanes": {
          "allowed": [
            "recovery",
            "maintenance"
          ],
          "prohibited": [
            "power",
            "peak",
            "strength"
          ],
          "required": "recovery",
          "preferredByRole": {
            "primary": "recovery",
            "secondary": "recovery",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "maintenance"
            ],
            "secondary": [
              "maintenance"
            ],
            "accessory": [
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "fatigue_reduction",
            "rep_region"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_transition",
                "role:primary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_transition",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_transition",
                "role:secondary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_transition",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "recovery": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_transition",
                "role:accessory",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
              "provenance": [
                "mesocycle:powerbuilding_transition",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "low",
          "progression": "reduce",
          "recoveryAdjustment": "required"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets"
          ],
          "prohibited": [
            "amrap",
            "dynamic_effort",
            "max_effort",
            "heavy_single_triple_five_backoffs",
            "bbb"
          ],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "deload",
          "fatiguePenalty": "high",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "recovery",
          "status": "required",
          "thresholdPolicyId": "mesocycle:powerbuilding_transition:dropoff:v1",
          "response": "reduce",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "recovery_first",
          "monitoring": "recovery",
          "stopPolicy": "reduce"
        },
        "specialState": "deload",
        "progression": {
          "permitted": [
            "fatigue_reduction"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Next cycle chosen"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Readiness restored"
          ],
          "exitRequirements": [
            "Next cycle chosen"
          ],
          "approvedSuccessors": [
            "powerbuilding_hypertrophy"
          ]
        }
      }
    },
    {
      "id": "strength_general",
      "engine": "strength",
      "adaptation": "Build work capacity and movement tolerance",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 3,
      "defaultWeeks": 4,
      "maximumWeeks": 6,
      "primaryStimulus": "General strength and muscle",
      "maintenanceStimuli": [
        "Competition lift skill"
      ],
      "successCriteria": [
        "Prepared for lift-specific work"
      ],
      "exitCriteria": [
        "Capacity established"
      ],
      "failureRoute": "Reduce complexity",
      "nextStates": [
        "strength_accumulation"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "strength_general",
        "purpose": "Build work capacity and movement tolerance",
        "primaryAdaptation": "General strength and muscle",
        "retainedQualities": [
          "Competition lift skill"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "hypertrophy_strength",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_general:dropoff:v1",
              "provenance": [
                "mesocycle:strength_general",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "heavy_single_triple_five_backoffs"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:strength_general:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Capacity established"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Prepared for lift-specific work"
          ],
          "exitRequirements": [
            "Capacity established"
          ],
          "approvedSuccessors": [
            "strength_accumulation"
          ]
        }
      }
    },
    {
      "id": "strength_accumulation",
      "engine": "strength",
      "adaptation": "Build maximal-force capacity",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 4,
      "defaultWeeks": 6,
      "maximumWeeks": 10,
      "primaryStimulus": "Lift-specific back-off volume",
      "maintenanceStimuli": [
        "Assistance"
      ],
      "successCriteria": [
        "Repeatable strength improvement"
      ],
      "exitCriteria": [
        "Specificity required or fatigue"
      ],
      "failureRoute": "Reassess dose",
      "nextStates": [
        "strength_specific"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "strength_accumulation",
        "purpose": "Build maximal-force capacity",
        "primaryAdaptation": "Lift-specific back-off volume",
        "retainedQualities": [
          "Assistance"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "hypertrophy_strength",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
              "provenance": [
                "mesocycle:strength_accumulation",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "heavy_single_triple_five_backoffs",
            "five_three_one",
            "ladder"
          ],
          "prohibited": [],
          "conditional": [
            "cluster",
            "ladder"
          ]
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:strength_accumulation:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Specificity required or fatigue"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Repeatable strength improvement"
          ],
          "exitRequirements": [
            "Specificity required or fatigue"
          ],
          "approvedSuccessors": [
            "strength_specific"
          ]
        }
      }
    },
    {
      "id": "strength_specific",
      "engine": "strength",
      "adaptation": "Transfer strength to target lifts",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 3,
      "defaultWeeks": 4,
      "maximumWeeks": 7,
      "primaryStimulus": "High-specificity lift work",
      "maintenanceStimuli": [
        "Limitations work"
      ],
      "successCriteria": [
        "Specific heavy performance improves"
      ],
      "exitCriteria": [
        "Peak or fatigue"
      ],
      "failureRoute": "Return to accumulation",
      "nextStates": [
        "strength_intensification",
        "strength_accumulation"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "strength_specific",
        "purpose": "Transfer strength to target lifts",
        "primaryAdaptation": "High-specificity lift work",
        "retainedQualities": [
          "Limitations work"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "high",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 1,
          "maximumRepTarget": 12,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_specific:dropoff:v1",
              "provenance": [
                "mesocycle:strength_specific",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "heavy_single_triple_five_backoffs",
            "cluster"
          ],
          "prohibited": [],
          "conditional": [
            "cluster",
            "ladder"
          ]
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "high",
          "technicalComplexity": "high",
          "specificity": "specific",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "moderate",
          "specificityBonus": "moderate",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "specific",
          "loadability": "required",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "required",
          "thresholdPolicyId": "mesocycle:strength_specific:dropoff:v1",
          "response": "stop",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "tight",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Peak or fatigue"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Specific heavy performance improves"
          ],
          "exitRequirements": [
            "Peak or fatigue"
          ],
          "approvedSuccessors": [
            "strength_intensification",
            "strength_accumulation"
          ]
        }
      }
    },
    {
      "id": "strength_intensification",
      "engine": "strength",
      "adaptation": "Heavy specific practice",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 2,
      "defaultWeeks": 3,
      "maximumWeeks": 5,
      "primaryStimulus": "High intensity declining volume",
      "maintenanceStimuli": [
        "Technique"
      ],
      "successCriteria": [
        "Stable heavy work"
      ],
      "exitCriteria": [
        "Taper or regression"
      ],
      "failureRoute": "Taper",
      "nextStates": [
        "strength_taper"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "strength_intensification",
        "purpose": "Heavy specific practice",
        "primaryAdaptation": "High intensity declining volume",
        "retainedQualities": [
          "Technique"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "high",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 1,
          "maximumRepTarget": 12,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_intensification:dropoff:v1",
              "provenance": [
                "mesocycle:strength_intensification",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "heavy_single_triple_five_backoffs",
            "max_effort"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "high",
          "technicalComplexity": "high",
          "specificity": "specific",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "moderate",
          "specificityBonus": "moderate",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "specific",
          "loadability": "required",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "required",
          "thresholdPolicyId": "mesocycle:strength_intensification:dropoff:v1",
          "response": "stop",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "tight",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Taper or regression"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Stable heavy work"
          ],
          "exitRequirements": [
            "Taper or regression"
          ],
          "approvedSuccessors": [
            "strength_taper"
          ]
        }
      }
    },
    {
      "id": "strength_taper",
      "engine": "strength",
      "adaptation": "Express strength with reduced fatigue",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 2,
      "maximumWeeks": 2,
      "primaryStimulus": "Reduced volume and retained intensity",
      "maintenanceStimuli": [],
      "successCriteria": [
        "Best available strength"
      ],
      "exitCriteria": [
        "Test complete"
      ],
      "failureRoute": "Transition",
      "nextStates": [
        "strength_transition"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "strength_taper",
        "purpose": "Express strength with reduced fatigue",
        "primaryAdaptation": "Reduced volume and retained intensity",
        "retainedQualities": [],
        "prohibitedEmphases": [
          "high fatigue accumulation"
        ],
        "loading": {
          "character": "very_high",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "strength",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "strength",
            "strength_support",
            "hypertrophy_strength",
            "maintenance"
          ],
          "prohibited": [
            "power"
          ],
          "preferredByRole": {
            "primary": "strength",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "hypertrophy_strength",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": [
            "strength"
          ]
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 1,
          "maximumRepTarget": 12,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "strength": {
              "minReps": 1,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:primary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:secondary",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "rep_progression",
              "establishedLoad": "preferred",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:accessory",
                "lane:strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_taper:dropoff:v1",
              "provenance": [
                "mesocycle:strength_taper",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets"
          ],
          "prohibited": [
            "amrap",
            "eight_across",
            "max_effort",
            "bbb"
          ],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "high",
          "technicalComplexity": "high",
          "specificity": "specific",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "taper",
          "fatiguePenalty": "moderate",
          "specificityBonus": "high",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "specific",
          "loadability": "required",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "required",
          "thresholdPolicyId": "mesocycle:strength_taper:dropoff:v1",
          "response": "stop",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "very_tight",
          "monitoring": "rep",
          "stopPolicy": "stop"
        },
        "specialState": "taper",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Test complete"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Best available strength"
          ],
          "exitRequirements": [
            "Test complete"
          ],
          "approvedSuccessors": [
            "strength_transition"
          ]
        }
      }
    },
    {
      "id": "strength_transition",
      "engine": "strength",
      "adaptation": "Physical and psychological recovery",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 2,
      "maximumWeeks": 3,
      "primaryStimulus": "Low structured loading",
      "maintenanceStimuli": [],
      "successCriteria": [
        "Readiness restored"
      ],
      "exitCriteria": [
        "Next goal selected"
      ],
      "failureRoute": "Extend briefly",
      "nextStates": [
        "strength_general"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "strength_transition",
        "purpose": "Physical and psychological recovery",
        "primaryAdaptation": "Low structured loading",
        "retainedQualities": [],
        "prohibitedEmphases": [
          "maximal accumulation",
          "failure chasing"
        ],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": true,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "recovery",
            "hypertrophy"
          ],
          "prohibited": [
            "expression",
            "power"
          ],
          "preferred": "recovery",
          "readinessRestriction": "recovery_first"
        },
        "concreteLanes": {
          "allowed": [
            "recovery",
            "maintenance"
          ],
          "prohibited": [
            "power",
            "peak",
            "strength"
          ],
          "required": "recovery",
          "preferredByRole": {
            "primary": "recovery",
            "secondary": "recovery",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "maintenance"
            ],
            "secondary": [
              "maintenance"
            ],
            "accessory": [
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "fatigue_reduction",
            "rep_region"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_transition:dropoff:v1",
              "provenance": [
                "mesocycle:strength_transition",
                "role:primary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_transition:dropoff:v1",
              "provenance": [
                "mesocycle:strength_transition",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_transition:dropoff:v1",
              "provenance": [
                "mesocycle:strength_transition",
                "role:secondary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_transition:dropoff:v1",
              "provenance": [
                "mesocycle:strength_transition",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "recovery": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_transition:dropoff:v1",
              "provenance": [
                "mesocycle:strength_transition",
                "role:accessory",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:strength_transition:dropoff:v1",
              "provenance": [
                "mesocycle:strength_transition",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "low",
          "progression": "reduce",
          "recoveryAdjustment": "required"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets"
          ],
          "prohibited": [
            "amrap",
            "dynamic_effort",
            "max_effort",
            "heavy_single_triple_five_backoffs",
            "bbb"
          ],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "deload",
          "fatiguePenalty": "high",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "recovery",
          "status": "required",
          "thresholdPolicyId": "mesocycle:strength_transition:dropoff:v1",
          "response": "reduce",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "recovery_first",
          "monitoring": "recovery",
          "stopPolicy": "reduce"
        },
        "specialState": "deload",
        "progression": {
          "permitted": [
            "fatigue_reduction"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Next goal selected"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Readiness restored"
          ],
          "exitRequirements": [
            "Next goal selected"
          ],
          "approvedSuccessors": [
            "strength_general"
          ]
        }
      }
    },
    {
      "id": "athletic_general",
      "engine": "athletic_performance",
      "adaptation": "General athletic preparation",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 4,
      "defaultWeeks": 6,
      "maximumWeeks": 10,
      "primaryStimulus": "General strength, capacity and low-dose power",
      "maintenanceStimuli": [
        "Movement quality"
      ],
      "successCriteria": [
        "Improved tolerance and capacity"
      ],
      "exitCriteria": [
        "Ready for force or power work"
      ],
      "failureRoute": "Remain general",
      "nextStates": [
        "athletic_force",
        "athletic_power"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "athletic_general",
        "purpose": "General athletic preparation",
        "primaryAdaptation": "General strength, capacity and low-dose power",
        "retainedQualities": [
          "Movement quality"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_general:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_general",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "antagonist_superset"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:athletic_general:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Ready for force or power work"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Improved tolerance and capacity"
          ],
          "exitRequirements": [
            "Ready for force or power work"
          ],
          "approvedSuccessors": [
            "athletic_force",
            "athletic_power"
          ]
        }
      }
    },
    {
      "id": "athletic_force",
      "engine": "athletic_performance",
      "adaptation": "General force development",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 4,
      "defaultWeeks": 6,
      "maximumWeeks": 10,
      "primaryStimulus": "Technically controlled strength",
      "maintenanceStimuli": [
        "Power quality"
      ],
      "successCriteria": [
        "Strength improves without output loss"
      ],
      "exitCriteria": [
        "Returns decline or power priority"
      ],
      "failureRoute": "Return to general preparation",
      "nextStates": [
        "athletic_power",
        "athletic_transition"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "athletic_force",
        "purpose": "General force development",
        "primaryAdaptation": "Technically controlled strength",
        "retainedQualities": [
          "Power quality"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "hypertrophy",
            "strength"
          ],
          "prohibited": [],
          "preferred": "hypertrophy",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "hypertrophy",
            "hypertrophy_strength",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "hypertrophy",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "hypertrophy_strength",
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "rep_region",
            "established_load"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:primary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:primary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "hypertrophy": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:secondary",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:secondary",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "hypertrophy": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:accessory",
                "lane:hypertrophy"
              ]
            },
            "hypertrophy_strength": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:accessory",
                "lane:hypertrophy_strength"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_force:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_force",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "cluster"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "moderate"
        },
        "specialStateScoring": {
          "state": "standard",
          "fatiguePenalty": "none",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "rep",
          "status": "permitted",
          "thresholdPolicyId": "mesocycle:athletic_force:dropoff:v1",
          "response": "continue",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "normal",
          "monitoring": "rep",
          "stopPolicy": "continue"
        },
        "specialState": "standard",
        "progression": {
          "permitted": [
            "double_progression",
            "load_progression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Returns decline or power priority"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Strength improves without output loss"
          ],
          "exitRequirements": [
            "Returns decline or power priority"
          ],
          "approvedSuccessors": [
            "athletic_power",
            "athletic_transition"
          ]
        }
      }
    },
    {
      "id": "athletic_power",
      "engine": "athletic_performance",
      "adaptation": "General power and speed development",
      "eligibility": [
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 3,
      "defaultWeeks": 4,
      "maximumWeeks": 8,
      "primaryStimulus": "Low-rep maximal-intent work",
      "maintenanceStimuli": [
        "Strength"
      ],
      "successCriteria": [
        "Output improves without availability loss"
      ],
      "exitCriteria": [
        "Stall or fatigue"
      ],
      "failureRoute": "Return to force/general",
      "nextStates": [
        "athletic_transition",
        "athletic_force"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "athletic_power",
        "purpose": "General power and speed development",
        "primaryAdaptation": "Low-rep maximal-intent work",
        "retainedQualities": [
          "Strength"
        ],
        "prohibitedEmphases": [],
        "loading": {
          "character": "high",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "power",
            "strength"
          ],
          "prohibited": [],
          "preferred": "power",
          "readinessRestriction": "none"
        },
        "concreteLanes": {
          "allowed": [
            "power",
            "strength_support",
            "maintenance"
          ],
          "prohibited": [],
          "preferredByRole": {
            "primary": "power",
            "secondary": "strength_support",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "strength_support",
              "maintenance"
            ],
            "secondary": [
              "strength_support",
              "maintenance"
            ],
            "accessory": [
              "strength_support",
              "maintenance"
            ]
          },
          "calibrationRequired": [
            "power"
          ],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "velocity_intent",
            "established_load"
          ],
          "minimumRepTarget": 1,
          "maximumRepTarget": 12,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "power": {
              "minReps": 1,
              "maxReps": 5,
              "preferredBias": "lower",
              "loadingMode": "velocity_intent",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:primary",
                "lane:power"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:primary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "power": {
              "minReps": 4,
              "maxReps": 5,
              "preferredBias": "lower",
              "loadingMode": "velocity_intent",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:secondary",
                "lane:power"
              ]
            },
            "strength_support": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:secondary",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "power": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "lower",
              "loadingMode": "velocity_intent",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:accessory",
                "lane:power"
              ]
            },
            "strength_support": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:accessory",
                "lane:strength_support"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "rep_progression",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_power:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_power",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "moderate",
          "progression": "increase",
          "recoveryAdjustment": "permitted"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets",
            "pyramid",
            "dynamic_effort"
          ],
          "prohibited": [],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "high",
          "technicalComplexity": "high",
          "specificity": "specific",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "speed_power",
          "fatiguePenalty": "moderate",
          "specificityBonus": "moderate",
          "velocityRequired": true
        },
        "strengthAnchor": {
          "required": true,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "specific",
          "loadability": "required",
          "calibrationRequired": true
        },
        "dropOff": {
          "monitoring": "velocity",
          "status": "required",
          "thresholdPolicyId": "mesocycle:athletic_power:dropoff:v1",
          "response": "stop",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "tight",
          "monitoring": "velocity",
          "stopPolicy": "continue"
        },
        "specialState": "speed_power",
        "progression": {
          "permitted": [
            "velocity_intent",
            "expression"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Stall or fatigue"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Output improves without availability loss"
          ],
          "exitRequirements": [
            "Stall or fatigue"
          ],
          "approvedSuccessors": [
            "athletic_transition",
            "athletic_force"
          ]
        }
      }
    },
    {
      "id": "athletic_transition",
      "engine": "athletic_performance",
      "adaptation": "Restore general athletic readiness",
      "eligibility": [
        "beginner",
        "intermediate",
        "advanced"
      ],
      "minimumWeeks": 1,
      "defaultWeeks": 2,
      "maximumWeeks": 4,
      "primaryStimulus": "Reduced formal stress",
      "maintenanceStimuli": [],
      "successCriteria": [
        "Readiness restored"
      ],
      "exitCriteria": [
        "Next block selected"
      ],
      "failureRoute": "Extend briefly",
      "nextStates": [
        "athletic_general"
      ],
      "policy": {
        "schemaVersion": "mesocycle_prescription_policy_v1",
        "mesocycleId": "athletic_transition",
        "purpose": "Restore general athletic readiness",
        "primaryAdaptation": "Reduced formal stress",
        "retainedQualities": [],
        "prohibitedEmphases": [
          "maximal accumulation",
          "failure chasing"
        ],
        "loading": {
          "character": "moderate",
          "establishedPercentagePermitted": false,
          "calibrationRequired": false
        },
        "lane": {
          "allowed": [
            "recovery",
            "hypertrophy"
          ],
          "prohibited": [
            "expression",
            "power"
          ],
          "preferred": "recovery",
          "readinessRestriction": "recovery_first"
        },
        "concreteLanes": {
          "allowed": [
            "recovery",
            "maintenance"
          ],
          "prohibited": [
            "power",
            "peak",
            "strength"
          ],
          "required": "recovery",
          "preferredByRole": {
            "primary": "recovery",
            "secondary": "recovery",
            "accessory": "maintenance"
          },
          "fallbacksByRole": {
            "primary": [
              "maintenance"
            ],
            "secondary": [
              "maintenance"
            ],
            "accessory": [
              "maintenance"
            ]
          },
          "calibrationRequired": [],
          "establishedLoadRequired": []
        },
        "targets": {
          "modes": [
            "fatigue_reduction",
            "rep_region"
          ],
          "minimumRepTarget": 4,
          "maximumRepTarget": 20,
          "establishedLoadRequired": false,
          "backOffPermitted": true,
          "failureOrAmrapPermitted": false
        },
        "targetEnvelopes": {
          "primary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_transition:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_transition",
                "role:primary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_transition:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_transition",
                "role:primary",
                "lane:maintenance"
              ]
            }
          },
          "secondary": {
            "recovery": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_transition:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_transition",
                "role:secondary",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 4,
              "maxReps": 15,
              "preferredBias": "moderate",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_transition:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_transition",
                "role:secondary",
                "lane:maintenance"
              ]
            }
          },
          "accessory": {
            "recovery": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_transition:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_transition",
                "role:accessory",
                "lane:recovery"
              ]
            },
            "maintenance": {
              "minReps": 8,
              "maxReps": 20,
              "preferredBias": "higher",
              "loadingMode": "fatigue_reduction",
              "establishedLoad": "not_required",
              "backOffPermitted": true,
              "amrapPermitted": false,
              "failurePermitted": false,
              "dropOffPolicyId": "mesocycle:athletic_transition:dropoff:v1",
              "provenance": [
                "mesocycle:athletic_transition",
                "role:accessory",
                "lane:maintenance"
              ]
            }
          }
        },
        "volume": {
          "character": "low",
          "progression": "reduce",
          "recoveryAdjustment": "required"
        },
        "methods": {
          "permitted": [
            "straight_sets",
            "back_off_sets"
          ],
          "prohibited": [
            "amrap",
            "dynamic_effort",
            "max_effort",
            "heavy_single_triple_five_backoffs",
            "bbb"
          ],
          "conditional": []
        },
        "exerciseSuitability": {
          "roles": [
            "primary_compound",
            "secondary_compound",
            "accessory",
            "isolation",
            "power",
            "recovery"
          ],
          "stability": "moderate",
          "technicalComplexity": "moderate",
          "specificity": "mixed",
          "fatigueCost": "high"
        },
        "specialStateScoring": {
          "state": "deload",
          "fatiguePenalty": "high",
          "specificityBonus": "none",
          "velocityRequired": false
        },
        "strengthAnchor": {
          "required": false,
          "roles": [
            "primary_compound",
            "secondary_compound"
          ],
          "specificity": "mixed",
          "loadability": "preferred",
          "calibrationRequired": false
        },
        "dropOff": {
          "monitoring": "recovery",
          "status": "required",
          "thresholdPolicyId": "mesocycle:athletic_transition:dropoff:v1",
          "response": "reduce",
          "evidenceRequired": true
        },
        "fatigue": {
          "boundary": "recovery_first",
          "monitoring": "recovery",
          "stopPolicy": "reduce"
        },
        "specialState": "deload",
        "progression": {
          "permitted": [
            "fatigue_reduction"
          ],
          "evidenceRequired": true,
          "exitEvidence": [
            "Next block selected"
          ]
        },
        "transition": {
          "entryRequirements": [
            "macrocycle permits mesocycle"
          ],
          "continuationRequirements": [
            "Readiness restored"
          ],
          "exitRequirements": [
            "Next block selected"
          ],
          "approvedSuccessors": [
            "athletic_general"
          ]
        }
      }
    }
  ]
}
```
