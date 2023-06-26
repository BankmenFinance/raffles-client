export type Raffles = {
  version: '0.1.0';
  name: 'raffles';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'config';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rafflesProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rafflesProgramData';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'upgradeAuthority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: 'InitializeArgs';
          };
        }
      ];
    },
    {
      name: 'setAuthoity';
      accounts: [
        {
          name: 'config';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'newAuthority';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'createRaffle';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proceedsMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'endTimestamp';
          type: 'i64';
        },
        {
          name: 'ticketPrice';
          type: 'u64';
        },
        {
          name: 'maxEntrants';
          type: 'u32';
        }
      ];
    },
    {
      name: 'addPrize';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'from';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'prize';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'prizeMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'prizeIndex';
          type: 'u32';
        },
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'buyTickets';
      accounts: [
        {
          name: 'config';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'raffle';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'buyerTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'buyerTransferAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u32';
        }
      ];
    },
    {
      name: 'revealWinners';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'recentBlockhashes';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'claimPrize';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'entrants';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'prize';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'winnerTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'prizeIndex';
          type: 'u32';
        },
        {
          name: 'ticketIndex';
          type: 'u32';
        }
      ];
    },
    {
      name: 'collectProceeds';
      accounts: [
        {
          name: 'config';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'raffle';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'creatorProceeds';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'protocolProceeds';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'closeEntrants';
      accounts: [
        {
          name: 'raffle';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'config';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'protocolFee';
            type: 'u16';
          },
          {
            name: 'padding';
            type: {
              array: ['u16', 3];
            };
          },
          {
            name: 'paddng2';
            type: {
              array: ['u64', 11];
            };
          }
        ];
      };
    },
    {
      name: 'raffle';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'padding';
            type: {
              array: ['u8', 7];
            };
          },
          {
            name: 'creator';
            type: 'publicKey';
          },
          {
            name: 'entrants';
            type: 'publicKey';
          },
          {
            name: 'proceedsMint';
            type: 'publicKey';
          },
          {
            name: 'randomness';
            type: {
              option: {
                array: ['u8', 32];
              };
            };
          },
          {
            name: 'totalPrizes';
            type: 'u32';
          },
          {
            name: 'claimedPrizes';
            type: 'u32';
          },
          {
            name: 'endTimestamp';
            type: 'i64';
          },
          {
            name: 'ticketPrice';
            type: 'u64';
          }
        ];
      };
    },
    {
      name: 'entrants';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'total';
            type: 'u32';
          },
          {
            name: 'max';
            type: 'u32';
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'InitializeArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'protocolFee';
            docs: ['The protocol fee, denominated in basis points.'];
            type: 'u16';
          }
        ];
      };
    }
  ];
  events: [
    {
      name: 'RaffleCreated';
      fields: [
        {
          name: 'raffle';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'creator';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'endTimestamp';
          type: 'i64';
          index: false;
        },
        {
          name: 'ticketPrice';
          type: 'u64';
          index: false;
        },
        {
          name: 'maxEntrants';
          type: 'u32';
          index: false;
        }
      ];
    },
    {
      name: 'PrizeAdded';
      fields: [
        {
          name: 'raffle';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'prize';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'prizeIndex';
          type: 'u32';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        }
      ];
    },
    {
      name: 'WinnerRevealed';
      fields: [
        {
          name: 'raffle';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'randomness';
          type: {
            array: ['u8', 32];
          };
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'EntrantsAccountTooSmallForMaxEntrants';
      msg: 'Entrants account too small for max entrants';
    },
    {
      code: 6001;
      name: 'RaffleEnded';
      msg: 'Raffle has ended';
    },
    {
      code: 6002;
      name: 'InvalidPrizeIndex';
      msg: 'Invalid prize index';
    },
    {
      code: 6003;
      name: 'NoPrize';
      msg: 'No prize';
    },
    {
      code: 6004;
      name: 'InvalidCalculation';
      msg: 'Invalid calculation';
    },
    {
      code: 6005;
      name: 'NotEnoughTicketsLeft';
      msg: 'Not enough tickets left';
    },
    {
      code: 6006;
      name: 'RaffleStillRunning';
      msg: 'Raffle is still running';
    },
    {
      code: 6007;
      name: 'WinnersAlreadyDrawn';
      msg: 'Winner already drawn';
    },
    {
      code: 6008;
      name: 'WinnerNotDrawn';
      msg: 'Winner not drawn';
    },
    {
      code: 6009;
      name: 'InvalidRevealedData';
      msg: 'Invalid revealed data';
    },
    {
      code: 6010;
      name: 'TokenAccountNotOwnedByWinner';
      msg: 'Ticket account not owned by winner';
    },
    {
      code: 6011;
      name: 'TicketHasNotWon';
      msg: 'Ticket has not won';
    },
    {
      code: 6012;
      name: 'UnclaimedPrizes';
      msg: 'Unclaimed prizes';
    },
    {
      code: 6013;
      name: 'InvalidRecentBlockhashes';
      msg: 'Invalid recent blockhashes';
    },
    {
      code: 6014;
      name: 'OnlyCreatorCanClaimNoEntrantRafflePrizes';
      msg: 'Only the creator can calin no entrant raffle prizes';
    },
    {
      code: 6015;
      name: 'InvalidTreasuryTokenAccountOwner';
      msg: 'Invalid treasury token account owner';
    }
  ];
};

export const IDL: Raffles = {
  version: '0.1.0',
  name: 'raffles',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'config',
          isMut: true,
          isSigner: false
        },
        {
          name: 'rafflesProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rafflesProgramData',
          isMut: false,
          isSigner: false
        },
        {
          name: 'upgradeAuthority',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'args',
          type: {
            defined: 'InitializeArgs'
          }
        }
      ]
    },
    {
      name: 'setAuthoity',
      accounts: [
        {
          name: 'config',
          isMut: true,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true
        }
      ],
      args: [
        {
          name: 'newAuthority',
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'createRaffle',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false
        },
        {
          name: 'proceedsMint',
          isMut: false,
          isSigner: false
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'endTimestamp',
          type: 'i64'
        },
        {
          name: 'ticketPrice',
          type: 'u64'
        },
        {
          name: 'maxEntrants',
          type: 'u32'
        }
      ]
    },
    {
      name: 'addPrize',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false
        },
        {
          name: 'from',
          isMut: true,
          isSigner: false
        },
        {
          name: 'prize',
          isMut: true,
          isSigner: false
        },
        {
          name: 'prizeMint',
          isMut: false,
          isSigner: false
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'prizeIndex',
          type: 'u32'
        },
        {
          name: 'amount',
          type: 'u64'
        }
      ]
    },
    {
      name: 'buyTickets',
      accounts: [
        {
          name: 'config',
          isMut: false,
          isSigner: false
        },
        {
          name: 'raffle',
          isMut: false,
          isSigner: false
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false
        },
        {
          name: 'buyerTokenAccount',
          isMut: true,
          isSigner: false
        },
        {
          name: 'buyerTransferAuthority',
          isMut: false,
          isSigner: true
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'amount',
          type: 'u32'
        }
      ]
    },
    {
      name: 'revealWinners',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false
        },
        {
          name: 'recentBlockhashes',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'claimPrize',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false
        },
        {
          name: 'entrants',
          isMut: false,
          isSigner: false
        },
        {
          name: 'prize',
          isMut: true,
          isSigner: false
        },
        {
          name: 'winnerTokenAccount',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'prizeIndex',
          type: 'u32'
        },
        {
          name: 'ticketIndex',
          type: 'u32'
        }
      ]
    },
    {
      name: 'collectProceeds',
      accounts: [
        {
          name: 'config',
          isMut: false,
          isSigner: false
        },
        {
          name: 'raffle',
          isMut: false,
          isSigner: false
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true
        },
        {
          name: 'creatorProceeds',
          isMut: true,
          isSigner: false
        },
        {
          name: 'protocolProceeds',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'closeEntrants',
      accounts: [
        {
          name: 'raffle',
          isMut: false,
          isSigner: false
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: 'config',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey'
          },
          {
            name: 'protocolFee',
            type: 'u16'
          },
          {
            name: 'padding',
            type: {
              array: ['u16', 3]
            }
          },
          {
            name: 'paddng2',
            type: {
              array: ['u64', 11]
            }
          }
        ]
      }
    },
    {
      name: 'raffle',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8'
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 7]
            }
          },
          {
            name: 'creator',
            type: 'publicKey'
          },
          {
            name: 'entrants',
            type: 'publicKey'
          },
          {
            name: 'proceedsMint',
            type: 'publicKey'
          },
          {
            name: 'randomness',
            type: {
              option: {
                array: ['u8', 32]
              }
            }
          },
          {
            name: 'totalPrizes',
            type: 'u32'
          },
          {
            name: 'claimedPrizes',
            type: 'u32'
          },
          {
            name: 'endTimestamp',
            type: 'i64'
          },
          {
            name: 'ticketPrice',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'entrants',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'total',
            type: 'u32'
          },
          {
            name: 'max',
            type: 'u32'
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'InitializeArgs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'protocolFee',
            docs: ['The protocol fee, denominated in basis points.'],
            type: 'u16'
          }
        ]
      }
    }
  ],
  events: [
    {
      name: 'RaffleCreated',
      fields: [
        {
          name: 'raffle',
          type: 'publicKey',
          index: false
        },
        {
          name: 'creator',
          type: 'publicKey',
          index: false
        },
        {
          name: 'endTimestamp',
          type: 'i64',
          index: false
        },
        {
          name: 'ticketPrice',
          type: 'u64',
          index: false
        },
        {
          name: 'maxEntrants',
          type: 'u32',
          index: false
        }
      ]
    },
    {
      name: 'PrizeAdded',
      fields: [
        {
          name: 'raffle',
          type: 'publicKey',
          index: false
        },
        {
          name: 'prize',
          type: 'publicKey',
          index: false
        },
        {
          name: 'prizeIndex',
          type: 'u32',
          index: false
        },
        {
          name: 'amount',
          type: 'u64',
          index: false
        }
      ]
    },
    {
      name: 'WinnerRevealed',
      fields: [
        {
          name: 'raffle',
          type: 'publicKey',
          index: false
        },
        {
          name: 'randomness',
          type: {
            array: ['u8', 32]
          },
          index: false
        }
      ]
    }
  ],
  errors: [
    {
      code: 6000,
      name: 'EntrantsAccountTooSmallForMaxEntrants',
      msg: 'Entrants account too small for max entrants'
    },
    {
      code: 6001,
      name: 'RaffleEnded',
      msg: 'Raffle has ended'
    },
    {
      code: 6002,
      name: 'InvalidPrizeIndex',
      msg: 'Invalid prize index'
    },
    {
      code: 6003,
      name: 'NoPrize',
      msg: 'No prize'
    },
    {
      code: 6004,
      name: 'InvalidCalculation',
      msg: 'Invalid calculation'
    },
    {
      code: 6005,
      name: 'NotEnoughTicketsLeft',
      msg: 'Not enough tickets left'
    },
    {
      code: 6006,
      name: 'RaffleStillRunning',
      msg: 'Raffle is still running'
    },
    {
      code: 6007,
      name: 'WinnersAlreadyDrawn',
      msg: 'Winner already drawn'
    },
    {
      code: 6008,
      name: 'WinnerNotDrawn',
      msg: 'Winner not drawn'
    },
    {
      code: 6009,
      name: 'InvalidRevealedData',
      msg: 'Invalid revealed data'
    },
    {
      code: 6010,
      name: 'TokenAccountNotOwnedByWinner',
      msg: 'Ticket account not owned by winner'
    },
    {
      code: 6011,
      name: 'TicketHasNotWon',
      msg: 'Ticket has not won'
    },
    {
      code: 6012,
      name: 'UnclaimedPrizes',
      msg: 'Unclaimed prizes'
    },
    {
      code: 6013,
      name: 'InvalidRecentBlockhashes',
      msg: 'Invalid recent blockhashes'
    },
    {
      code: 6014,
      name: 'OnlyCreatorCanClaimNoEntrantRafflePrizes',
      msg: 'Only the creator can calin no entrant raffle prizes'
    },
    {
      code: 6015,
      name: 'InvalidTreasuryTokenAccountOwner',
      msg: 'Invalid treasury token account owner'
    }
  ]
};
