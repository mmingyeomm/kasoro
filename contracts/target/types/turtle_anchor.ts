/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/turtle_anchor.json`.
 */
export type TurtleAnchor = {
  "address": "38cVbT7EHqPwfXR1VgXA5jJiBe3DSAFr6cdCEPx4fbAv",
  "metadata": {
    "name": "turtleAnchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "proposalId",
          "type": "u64"
        },
        {
          "name": "optionIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createVote",
      "discriminator": [
        173,
        115,
        165,
        78,
        226,
        132,
        205,
        254
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "voteType",
          "type": {
            "defined": {
              "name": "voteType"
            }
          }
        },
        {
          "name": "options",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "votingPeriod",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeDao",
      "discriminator": [
        128,
        226,
        96,
        90,
        39,
        56,
        24,
        196
      ],
      "accounts": [
        {
          "name": "initializer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "initializer"
              },
              {
                "kind": "arg",
                "path": "daoName"
              }
            ]
          }
        },
        {
          "name": "dao2",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  50
                ]
              },
              {
                "kind": "account",
                "path": "initializer"
              },
              {
                "kind": "arg",
                "path": "daoName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "daoName",
          "type": "string"
        },
        {
          "name": "timeLimit",
          "type": "u64"
        },
        {
          "name": "baseFee",
          "type": "u64"
        },
        {
          "name": "aiModeration",
          "type": "bool"
        },
        {
          "name": "depositShare",
          "type": "u8"
        }
      ]
    },
    {
      "name": "processTimeout",
      "discriminator": [
        248,
        194,
        110,
        91,
        207,
        32,
        200,
        207
      ],
      "accounts": [
        {
          "name": "caller",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "submitContent",
      "discriminator": [
        83,
        67,
        55,
        88,
        192,
        77,
        115,
        15
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "text",
          "type": "string"
        },
        {
          "name": "imageUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "toggleDaoState",
      "discriminator": [
        192,
        139,
        240,
        146,
        156,
        192,
        85,
        18
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "dao",
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "daoState",
      "discriminator": [
        24,
        50,
        14,
        105,
        233,
        60,
        201,
        244
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notADepositor",
      "msg": "Not a depositor"
    },
    {
      "code": 6001,
      "name": "invalidVotingPeriod",
      "msg": "Invalid voting period"
    },
    {
      "code": 6002,
      "name": "proposalNotFound",
      "msg": "Proposal not found"
    },
    {
      "code": 6003,
      "name": "proposalNotActive",
      "msg": "Proposal is not active"
    },
    {
      "code": 6004,
      "name": "votingPeriodEnded",
      "msg": "Voting period has ended"
    },
    {
      "code": 6005,
      "name": "invalidOptionIndex",
      "msg": "Invalid option index"
    },
    {
      "code": 6006,
      "name": "alreadyVoted",
      "msg": "Already voted"
    },
    {
      "code": 6007,
      "name": "timeoutNotReached",
      "msg": "Timeout not reached"
    },
    {
      "code": 6008,
      "name": "daoNotActive",
      "msg": "DAO is not active"
    },
    {
      "code": 6009,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access"
    },
    {
      "code": 6010,
      "name": "textTooLong",
      "msg": "Text too long"
    },
    {
      "code": 6011,
      "name": "imageUriTooLong",
      "msg": "Image URI too long"
    }
  ],
  "types": [
    {
      "name": "content",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "text",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "voteCount",
            "type": "u64"
          },
          {
            "name": "challengeAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "daoState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "daoName",
            "type": "string"
          },
          {
            "name": "initializer",
            "type": "pubkey"
          },
          {
            "name": "timeLimit",
            "type": "u64"
          },
          {
            "name": "baseFee",
            "type": "u64"
          },
          {
            "name": "aiModeration",
            "type": "bool"
          },
          {
            "name": "depositShare",
            "type": "u8"
          },
          {
            "name": "timeoutTimestamp",
            "type": "u64"
          },
          {
            "name": "totalDeposit",
            "type": "u64"
          },
          {
            "name": "depositors",
            "type": {
              "vec": {
                "defined": {
                  "name": "depositorInfo"
                }
              }
            }
          },
          {
            "name": "contents",
            "type": {
              "vec": {
                "defined": {
                  "name": "content"
                }
              }
            }
          },
          {
            "name": "voteProposals",
            "type": {
              "vec": {
                "defined": {
                  "name": "voteProposal"
                }
              }
            }
          },
          {
            "name": "nextProposalId",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "depositorInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "lockedUntil",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "optionIndex",
            "type": "u8"
          },
          {
            "name": "votingPower",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "voteType",
            "type": {
              "defined": {
                "name": "voteType"
              }
            }
          },
          {
            "name": "options",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          },
          {
            "name": "votes",
            "type": {
              "vec": {
                "defined": {
                  "name": "voteInfo"
                }
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "voteStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "voteStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "completed"
          },
          {
            "name": "executed"
          }
        ]
      }
    },
    {
      "name": "voteType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "changeTimeLimit"
          },
          {
            "name": "changeBaseFee"
          },
          {
            "name": "changeAiModeration"
          },
          {
            "name": "contentQualityRating"
          }
        ]
      }
    }
  ]
};
