/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/kasoro.json`.
 */
export type Kasoro = {
  "address": "CEnBjSSjuoL13LtgDeALeAMWqSg9W7t1J5rtjeKNarAM",
  "metadata": {
    "name": "kasoro",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "bountyDistribute",
      "discriminator": [
        33,
        73,
        137,
        160,
        30,
        38,
        10,
        62
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "community",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "targetPda",
          "type": "pubkey"
        },
        {
          "name": "vaultPda",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "community",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
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
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "community",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "targetPda",
          "type": "pubkey"
        },
        {
          "name": "vaultPda",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "initializer",
          "writable": true,
          "signer": true
        },
        {
          "name": "community",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  109,
                  117,
                  110,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "initializer"
              },
              {
                "kind": "arg",
                "path": "communityName"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "initializer"
              },
              {
                "kind": "arg",
                "path": "communityName"
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
          "name": "communityName",
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
          "name": "feeMultiplier",
          "type": "u8"
        },
        {
          "name": "lstAddr",
          "type": "pubkey"
        },
        {
          "name": "aiModeration",
          "type": "bool"
        },
        {
          "name": "vec",
          "type": {
            "vec": "f32"
          }
        }
      ]
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
          "name": "community",
          "writable": true
        },
        {
          "name": "vault",
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
    }
  ],
  "accounts": [
    {
      "name": "basefeeVault",
      "discriminator": [
        178,
        112,
        45,
        184,
        120,
        128,
        157,
        184
      ]
    },
    {
      "name": "communityState",
      "discriminator": [
        133,
        66,
        57,
        235,
        219,
        148,
        104,
        230
      ]
    }
  ],
  "types": [
    {
      "name": "basefeeVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositInfo",
            "type": {
              "vec": {
                "defined": {
                  "name": "depositersInfo"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "challengers",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ratio",
            "type": {
              "vec": "f32"
            }
          },
          {
            "name": "challengers",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "len",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "communityState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "communityName",
            "type": "string"
          },
          {
            "name": "timeLimit",
            "type": "u64"
          },
          {
            "name": "initBaseFee",
            "type": "u64"
          },
          {
            "name": "feeMultiplier",
            "type": "u8"
          },
          {
            "name": "prizeRatio",
            "type": {
              "defined": {
                "name": "challengers"
              }
            }
          },
          {
            "name": "voted",
            "type": "f32"
          },
          {
            "name": "votePeriod",
            "type": "u8"
          },
          {
            "name": "lstAddr",
            "type": "pubkey"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "aiModeration",
            "type": "bool"
          },
          {
            "name": "initializer",
            "type": "pubkey"
          },
          {
            "name": "contents",
            "type": {
              "vec": {
                "defined": {
                  "name": "creatorContent"
                }
              }
            }
          },
          {
            "name": "basefeeVault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "creatorContent",
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
          }
        ]
      }
    },
    {
      "name": "depositersInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositAddress",
            "type": "pubkey"
          },
          {
            "name": "bountyAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
