export type Raffles = {
  version: '0.1.1';
  name: 'raffles';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'config';
          isMut: true;
          isSigner: false;
          docs: ['The global [`Config`].'];
        },
        {
          name: 'rafflesProgram';
          isMut: false;
          isSigner: false;
          docs: ['The [`Raffles`] program.'];
        },
        {
          name: 'rafflesProgramData';
          isMut: false;
          isSigner: false;
          docs: ['The [`Raffles`] program data account.'];
        },
        {
          name: 'upgradeAuthority';
          isMut: false;
          isSigner: true;
          docs: ['The [`Raffles`] program upgrade authority.'];
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
          docs: ['The rent payer.'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
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
          docs: ['The global [`Config`].'];
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
          docs: ['The current authority of the [`Config`].'];
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
          docs: ['The [`Raffle`] Account we are creating.'];
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
          docs: [
            'The [`Entrants`] Account which contains ticket buyers for a certain [`Raffle`].'
          ];
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
          docs: ['The vault where proceeds of the [`Raffle`] are stored.'];
        },
        {
          name: 'proceedsMint';
          isMut: false;
          isSigner: false;
          docs: [
            'The SPL Token Mint in which tickets for the [`Raffle`] will be paid.'
          ];
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
          docs: ['The creator of the [`Raffle`].'];
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
          docs: ['The rent payer of the [`Raffle`].'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program Interface.'];
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program Interface.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: ['The Rent Sysvar.'];
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
          docs: [
            'The [`Raffle`] Account for which we are going to add a prize.'
          ];
        },
        {
          name: 'prize';
          isMut: true;
          isSigner: false;
          docs: ['The [`Prize`] Account that we are adding to the [`Raffle`].'];
        },
        {
          name: 'prizeMint';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The SPL Token Mint if the prize is not a Compressed NFT.'];
        },
        {
          name: 'prizeTokenAccount';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ['The SPL Token Mint if the prize is not a Compressed NFT.'];
        },
        {
          name: 'prizeEdition';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The prize [`Metadata`] master edition account.'];
        },
        {
          name: 'prizeMetadata';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ['The prize [`Metadata`] account.'];
        },
        {
          name: 'prizeTokenRecord';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: [
            'The prize [`Metadata`] Token Record Account if the prize is a Programmable NFT.'
          ];
        },
        {
          name: 'sourceTokenAccount';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: [
            'The [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The authority of the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The owner of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The delegate of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The source [`TokenAccount`] if the prize is not a Compressed NFT.'
          ];
        },
        {
          name: 'sourceTokenRecord';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: [
            'The source [`Metadata`] Token Record Account if the prize is a Programmable NFT.',
            ''
          ];
        },
        {
          name: 'authorizationRules';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: [
            'The [`Metadata`] Authorization Rule Set Account if the prize is a Programmable NFT.',
            ''
          ];
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
          docs: ['The creator of the [`Raffle`].'];
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
          docs: ['The rent payer.'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Token Program.'];
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Associated Token Account Program.'];
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Metaplex Token Metadata Program.'];
        },
        {
          name: 'authRulesProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Metaplex Token Auth Rules Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: [
            'The Metaplex Bubblegum Program.',
            'The Account Compression Program.',
            'The No Op Program.',
            'The Rent Sysvar.'
          ];
        },
        {
          name: 'instructions';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Instructions Sysvar.', ''];
        }
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: 'AddPrizeArgs';
          };
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
          docs: ['The global [`Config`].'];
        },
        {
          name: 'raffle';
          isMut: false;
          isSigner: false;
          docs: [
            'The [`Raffle`] Account for which we are going to buy a ticket.'
          ];
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
          docs: [
            'The [`Entrants`] Account which contains ticket buyers for a certain [`Raffle`].'
          ];
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
          docs: ['The vault where proceeds are stored.'];
        },
        {
          name: 'buyerTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The buyer's token account."];
        },
        {
          name: 'buyerTransferAuthority';
          isMut: false;
          isSigner: true;
          docs: ["The buyer's token account authority."];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program Interface.'];
        },
        {
          name: 'slotHashes';
          isMut: false;
          isSigner: false;
          docs: ['The Slot Hashes Sysvar.', ''];
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
          docs: ['The [`Raffle`] for which we are going to reveal a winner.'];
        },
        {
          name: 'entrants';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'slotHashes';
          isMut: false;
          isSigner: false;
          docs: ['The Slot Hashes Sysvar.', ''];
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
          docs: [
            'The [`Raffle`] Account for which we are going to claim a prize.'
          ];
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
          docs: ['The [`Prize`] that we are claiming.'];
        },
        {
          name: 'prizeMint';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The SPL Token Mint if the prize is not a Compressed NFT.'];
        },
        {
          name: 'prizeTokenAccount';
          isMut: true;
          isSigner: false;
          isOptional: true;
        },
        {
          name: 'prizeMetadata';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ['The prize metadata account.'];
        },
        {
          name: 'prizeEdition';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The prize master edition account.'];
        },
        {
          name: 'prizeTokenRecord';
          isMut: true;
          isSigner: false;
          isOptional: true;
        },
        {
          name: 'winnerTokenAccount';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: [
            'The [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The authority of the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The owner of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The delegate of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            "The winner's token account."
          ];
        },
        {
          name: 'winnerTokenRecord';
          isMut: true;
          isSigner: false;
          isOptional: true;
        },
        {
          name: 'authorizationRules';
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: [
            'The [`Metadata`] Authorization Rule Set Account if the prize is a Programmable NFT.',
            ''
          ];
        },
        {
          name: 'creator';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'winner';
          isMut: false;
          isSigner: false;
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
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Token Program Interface.'];
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Associated Token Account Program.'];
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Metaplex Token Metadata Program.'];
        },
        {
          name: 'authRulesProgram';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Metaplex Token Auth Rules Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: [
            'The Metaplex Bubblegum Program.',
            'The Account Compression Program.',
            'The No Op Program.',
            'The Rent Sysvar.'
          ];
        },
        {
          name: 'instructions';
          isMut: false;
          isSigner: false;
          isOptional: true;
          docs: ['The Instructions Sysvar.'];
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
        },
        {
          name: 'compressedArgs';
          type: {
            option: {
              defined: 'CompressedArgs';
            };
          };
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
          docs: ['The global [`Config`].'];
        },
        {
          name: 'raffle';
          isMut: false;
          isSigner: false;
          docs: [
            'The [`Raffle`] Account for which we are going to buy a ticket.'
          ];
        },
        {
          name: 'proceedsMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
          docs: ['The vault where proceeds of the [`Raffle`] are stored.'];
        },
        {
          name: 'creatorProceeds';
          isMut: true;
          isSigner: false;
          docs: ["The destination for the [`Raffle`] creator's proceeds."];
        },
        {
          name: 'protocolProceeds';
          isMut: true;
          isSigner: false;
          docs: ["The destination for the [`Raffle`] protocol's proceeds."];
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
          docs: ['The creator of the [`Raffle`].'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program Interface.'];
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
          docs: [
            'The [`Raffle`] Account for which we are going to add a prize.'
          ];
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
          docs: [
            'The [`Entrants`] Account which contains ticket buyers for a certain [`Raffle`].'
          ];
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
          docs: ['The creator of the [`Raffle`].'];
        }
      ];
      args: [];
    },
    {
      name: 'closeRaffle';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
          docs: [
            'The [`Raffle`] Account for which we are going to add a prize.'
          ];
        },
        {
          name: 'proceeds';
          isMut: true;
          isSigner: false;
          docs: ['The vault where proceeds of the [`Raffle`] are stored.'];
        },
        {
          name: 'creator';
          isMut: false;
          isSigner: true;
          docs: ['The creator of the [`Raffle`].'];
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'config';
      docs: [
        'This is a global program configuration account.',
        'This account can only be initialized by the program upgrade authority,',
        'which means it can only be initialized by the program deployer or by the',
        'multisig to which the program upgrade authority gets transferred to.',
        '',
        'This account will hold information regarding protocol fees, and any other',
        'important values or configs which might be needed in the future.'
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            docs: ["The authority of the program's config."];
            type: 'publicKey';
          },
          {
            name: 'protocolFee';
            docs: [
              'The protocol fee for raffle tickets, denominated in basis points.'
            ];
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
      docs: [
        'This account represents a raffle and holds information necessary to validate,',
        'reveal winners and let them claim their prizes once the raffle ends.'
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            docs: ['The bump of the account, for signer purposes.'];
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
            docs: ['The pubkey of the creator of the raffle.'];
            type: 'publicKey';
          },
          {
            name: 'entrants';
            docs: [
              'The pubkey of the entrants account, which holds information about the entrants in the raffle.'
            ];
            type: 'publicKey';
          },
          {
            name: 'proceedsMint';
            docs: ['The pubkey of the SPL Token Mint of the proceeds.'];
            type: 'publicKey';
          },
          {
            name: 'randomness';
            docs: ['The randomness used to derive the winners of the raffle.'];
            type: {
              option: {
                array: ['u8', 32];
              };
            };
          },
          {
            name: 'totalPrizes';
            docs: ['The total number of prizes for the raffle.'];
            type: 'u32';
          },
          {
            name: 'claimedPrizes';
            docs: [
              'The amount of prizes for the raffle that have been claimed.'
            ];
            type: 'u32';
          },
          {
            name: 'endTimestamp';
            docs: [
              'The timestamp at which the raffle ends and winners can be revealed.'
            ];
            type: 'i64';
          },
          {
            name: 'ticketPrice';
            docs: ['The ticket price in native units.'];
            type: 'u64';
          }
        ];
      };
    },
    {
      name: 'prize';
      docs: ['This account represents a prize for a certain [`Raffle`].'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            docs: ['The bump of the account, for signer purposes.'];
            type: 'u8';
          },
          {
            name: 'padding';
            type: {
              array: ['u8', 3];
            };
          },
          {
            name: 'prizeIndex';
            docs: ['The prize index.'];
            type: 'u32';
          },
          {
            name: 'raffle';
            docs: ['The [`Raffle`] that this prize is associated to.'];
            type: 'publicKey';
          },
          {
            name: 'mint';
            docs: [
              'The SPL Token Mint of the Token, Legacy or Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a Compressed NFT.'
            ];
            type: 'publicKey';
          },
          {
            name: 'metadata';
            docs: [
              'The Metadata Account of the Legacy or Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a SPL Token or Compressed NFT.'
            ];
            type: 'publicKey';
          },
          {
            name: 'edition';
            docs: [
              'The Edition Account of the Legacy or Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a SPL Token or Compressed NFT.'
            ];
            type: 'publicKey';
          },
          {
            name: 'tokenRecord';
            docs: [
              'The Token Record Account of the Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be an SPL Token, Legacy or Compressed NFT.'
            ];
            type: 'publicKey';
          },
          {
            name: 'authorizationRules';
            docs: [
              'The Authorization Rule Set Account of the Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be an SPL Token, Legacy or Compressed NFT.'
            ];
            type: 'publicKey';
          },
          {
            name: 'merkleTree';
            docs: [
              'The Merkle Tree of the Compressed NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a SPL Token, Legacy or Programmable NFT.'
            ];
            type: 'publicKey';
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
      name: 'CompressedArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'root';
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'dataHash';
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'creatorHash';
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'nonce';
            type: 'u64';
          },
          {
            name: 'index';
            type: 'u32';
          }
        ];
      };
    },
    {
      name: 'AddPrizeArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'prizeIndex';
            docs: [
              'The index of the prize, derived from [`Raffle`] `total_prizes`.',
              '',
              '[`Raffle`]: crate::state::Raffle'
            ];
            type: 'u32';
          },
          {
            name: 'amount';
            docs: ['The amount of the prize to add.'];
            type: 'u64';
          },
          {
            name: 'prizeType';
            docs: ['The type of the prize to add.'];
            type: {
              defined: 'PrizeType';
            };
          }
        ];
      };
    },
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
    },
    {
      name: 'PrizeType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Token';
          },
          {
            name: 'Compressed';
            fields: [
              {
                defined: 'CompressedArgs';
              }
            ];
          },
          {
            name: 'Legacy';
          },
          {
            name: 'Programmable';
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
          name: 'proceedsMint';
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
      name: 'RaffleClosed';
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
        },
        {
          name: 'mint';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'metadata';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'tokenRecord';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'merkleTree';
          type: 'publicKey';
          index: false;
        }
      ];
    },
    {
      name: 'TicketBought';
      fields: [
        {
          name: 'raffle';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'buyer';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'index';
          type: 'u32';
          index: false;
        }
      ];
    },
    {
      name: 'PrizeClaimed';
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
          name: 'ticketIndex';
          type: 'u32';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'winner';
          type: 'publicKey';
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
      name: 'InvalidTicketAmount';
      msg: 'Invalid ticket amount. Must not be greater than 20.';
    },
    {
      code: 6011;
      name: 'TokenAccountNotOwnedByWinner';
      msg: 'Ticket account not owned by winner';
    },
    {
      code: 6012;
      name: 'TicketHasNotWon';
      msg: 'Ticket has not won';
    },
    {
      code: 6013;
      name: 'UnclaimedPrizes';
      msg: 'Unclaimed prizes';
    },
    {
      code: 6014;
      name: 'InvalidRecentBlockhashes';
      msg: 'Invalid recent blockhashes';
    },
    {
      code: 6015;
      name: 'OnlyCreatorCanClaimNoEntrantRafflePrizes';
      msg: 'Only the creator can claim no entrant raffle prizes';
    },
    {
      code: 6016;
      name: 'InvalidTreasuryTokenAccountOwner';
      msg: 'Invalid treasury token account owner';
    },
    {
      code: 6017;
      name: 'PrizeMintNotProvided';
      msg: 'The prize token mint account was not provided';
    },
    {
      code: 6018;
      name: 'PrizeTokenAccountNotProvided';
      msg: 'The prize token account was not provided';
    },
    {
      code: 6019;
      name: 'SourceTokenAccountNotProvided';
      msg: 'The source token account was not provided';
    },
    {
      code: 6020;
      name: 'PrizeEditionNotProvided';
      msg: 'The prize edition account was not provided';
    },
    {
      code: 6021;
      name: 'PrizeMetadataNotProvided';
      msg: 'The prize metadata account was not provided';
    },
    {
      code: 6022;
      name: 'PrizeTokenRecordNotProvided';
      msg: 'The prize token record account was not provided';
    },
    {
      code: 6023;
      name: 'SourceTokenRecordNotProvided';
      msg: 'The source token record account was not provided';
    },
    {
      code: 6024;
      name: 'TokenProgramNotProvided';
      msg: 'The token program account was not provided';
    },
    {
      code: 6025;
      name: 'AssociatedTokenProgramNotProvided';
      msg: 'The associated token program account was not provided';
    },
    {
      code: 6026;
      name: 'MetadataProgramNotProvided';
      msg: 'The metadata program account was not provided';
    },
    {
      code: 6027;
      name: 'AuthorizationRulesProgramNotProvided';
      msg: 'The authorization rules program account was not provided';
    },
    {
      code: 6028;
      name: 'AuthorizationRuleNotProvided';
      msg: 'The authorization rule set account was not provided';
    },
    {
      code: 6029;
      name: 'InstructionsSysvarNotProvided';
      msg: 'The instructions sysvar account was not provided';
    },
    {
      code: 6030;
      name: 'WinnerTokenAccountNotProvided';
      msg: 'The winner token account was not provided';
    },
    {
      code: 6031;
      name: 'WinnerTokenRecordNotProvided';
      msg: 'The winner token record account was not provided';
    },
    {
      code: 6032;
      name: 'BubblegumProgramNotProvided';
      msg: 'The bubblegum program account was not provided';
    },
    {
      code: 6033;
      name: 'AccountCompressionProgramNotProvided';
      msg: 'The account compression program account was not provided';
    },
    {
      code: 6034;
      name: 'NoopProgramNotProvided';
      msg: 'The noop program account was not provided';
    },
    {
      code: 6035;
      name: 'PrizeMerkleTreeNotProvided';
      msg: 'The prize merkle tree account was not provided';
    },
    {
      code: 6036;
      name: 'PrizeMerkleTreeAuthorityNotProvided';
      msg: 'The prize merkle tree authority account was not provided';
    },
    {
      code: 6037;
      name: 'PrizeLeafOwnerNotProvided';
      msg: 'The prize leaf owner account was not provided';
    },
    {
      code: 6038;
      name: 'PrizeLeafDelegateNotProvided';
      msg: 'The prize leaf owner account was not provided';
    },
    {
      code: 6039;
      name: 'MerkleProofNotProvided';
      msg: 'The merkle proof was not provided';
    },
    {
      code: 6040;
      name: 'CompressedArgsNotProvided';
      msg: 'The compressed args were not provided';
    },
    {
      code: 6041;
      name: 'InvalidArgument';
      msg: 'Invalid argument';
    },
    {
      code: 6042;
      name: 'OnlyCreatorCanClaimInvalidWinnerDraw';
      msg: 'Only the creator can claim invalid winner draw';
    },
    {
      code: 6043;
      name: 'InvalidWinner';
      msg: 'Invalid winner';
    }
  ];
};

export const IDL: Raffles = {
  version: '0.1.1',
  name: 'raffles',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'config',
          isMut: true,
          isSigner: false,
          docs: ['The global [`Config`].']
        },
        {
          name: 'rafflesProgram',
          isMut: false,
          isSigner: false,
          docs: ['The [`Raffles`] program.']
        },
        {
          name: 'rafflesProgramData',
          isMut: false,
          isSigner: false,
          docs: ['The [`Raffles`] program data account.']
        },
        {
          name: 'upgradeAuthority',
          isMut: false,
          isSigner: true,
          docs: ['The [`Raffles`] program upgrade authority.']
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
          docs: ['The rent payer.']
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
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
          isSigner: false,
          docs: ['The global [`Config`].']
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
          docs: ['The current authority of the [`Config`].']
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
          isSigner: false,
          docs: ['The [`Raffle`] Account we are creating.']
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false,
          docs: [
            'The [`Entrants`] Account which contains ticket buyers for a certain [`Raffle`].'
          ]
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false,
          docs: ['The vault where proceeds of the [`Raffle`] are stored.']
        },
        {
          name: 'proceedsMint',
          isMut: false,
          isSigner: false,
          docs: [
            'The SPL Token Mint in which tickets for the [`Raffle`] will be paid.'
          ]
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true,
          docs: ['The creator of the [`Raffle`].']
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
          docs: ['The rent payer of the [`Raffle`].']
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program Interface.']
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program Interface.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: ['The Rent Sysvar.']
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
          isSigner: false,
          docs: [
            'The [`Raffle`] Account for which we are going to add a prize.'
          ]
        },
        {
          name: 'prize',
          isMut: true,
          isSigner: false,
          docs: ['The [`Prize`] Account that we are adding to the [`Raffle`].']
        },
        {
          name: 'prizeMint',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The SPL Token Mint if the prize is not a Compressed NFT.']
        },
        {
          name: 'prizeTokenAccount',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ['The SPL Token Mint if the prize is not a Compressed NFT.']
        },
        {
          name: 'prizeEdition',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The prize [`Metadata`] master edition account.']
        },
        {
          name: 'prizeMetadata',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ['The prize [`Metadata`] account.']
        },
        {
          name: 'prizeTokenRecord',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: [
            'The prize [`Metadata`] Token Record Account if the prize is a Programmable NFT.'
          ]
        },
        {
          name: 'sourceTokenAccount',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: [
            'The [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The authority of the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The owner of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The delegate of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The source [`TokenAccount`] if the prize is not a Compressed NFT.'
          ]
        },
        {
          name: 'sourceTokenRecord',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: [
            'The source [`Metadata`] Token Record Account if the prize is a Programmable NFT.',
            ''
          ]
        },
        {
          name: 'authorizationRules',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: [
            'The [`Metadata`] Authorization Rule Set Account if the prize is a Programmable NFT.',
            ''
          ]
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true,
          docs: ['The creator of the [`Raffle`].']
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
          docs: ['The rent payer.']
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Token Program.']
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Associated Token Account Program.']
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Metaplex Token Metadata Program.']
        },
        {
          name: 'authRulesProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Metaplex Token Auth Rules Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: [
            'The Metaplex Bubblegum Program.',
            'The Account Compression Program.',
            'The No Op Program.',
            'The Rent Sysvar.'
          ]
        },
        {
          name: 'instructions',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Instructions Sysvar.', '']
        }
      ],
      args: [
        {
          name: 'args',
          type: {
            defined: 'AddPrizeArgs'
          }
        }
      ]
    },
    {
      name: 'buyTickets',
      accounts: [
        {
          name: 'config',
          isMut: false,
          isSigner: false,
          docs: ['The global [`Config`].']
        },
        {
          name: 'raffle',
          isMut: false,
          isSigner: false,
          docs: [
            'The [`Raffle`] Account for which we are going to buy a ticket.'
          ]
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false,
          docs: [
            'The [`Entrants`] Account which contains ticket buyers for a certain [`Raffle`].'
          ]
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false,
          docs: ['The vault where proceeds are stored.']
        },
        {
          name: 'buyerTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The buyer's token account."]
        },
        {
          name: 'buyerTransferAuthority',
          isMut: false,
          isSigner: true,
          docs: ["The buyer's token account authority."]
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program Interface.']
        },
        {
          name: 'slotHashes',
          isMut: false,
          isSigner: false,
          docs: ['The Slot Hashes Sysvar.', '']
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
          isSigner: false,
          docs: ['The [`Raffle`] for which we are going to reveal a winner.']
        },
        {
          name: 'entrants',
          isMut: false,
          isSigner: false
        },
        {
          name: 'slotHashes',
          isMut: false,
          isSigner: false,
          docs: ['The Slot Hashes Sysvar.', '']
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
          isSigner: false,
          docs: [
            'The [`Raffle`] Account for which we are going to claim a prize.'
          ]
        },
        {
          name: 'entrants',
          isMut: false,
          isSigner: false
        },
        {
          name: 'prize',
          isMut: true,
          isSigner: false,
          docs: ['The [`Prize`] that we are claiming.']
        },
        {
          name: 'prizeMint',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The SPL Token Mint if the prize is not a Compressed NFT.']
        },
        {
          name: 'prizeTokenAccount',
          isMut: true,
          isSigner: false,
          isOptional: true
        },
        {
          name: 'prizeMetadata',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ['The prize metadata account.']
        },
        {
          name: 'prizeEdition',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The prize master edition account.']
        },
        {
          name: 'prizeTokenRecord',
          isMut: true,
          isSigner: false,
          isOptional: true
        },
        {
          name: 'winnerTokenAccount',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: [
            'The [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The authority of the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The owner of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            'The delegate of the leaf in the [`Bubblegum`] Concurrent Merkle Tree Account if the prize is a Compressed NFT.',
            '',
            "The winner's token account."
          ]
        },
        {
          name: 'winnerTokenRecord',
          isMut: true,
          isSigner: false,
          isOptional: true
        },
        {
          name: 'authorizationRules',
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: [
            'The [`Metadata`] Authorization Rule Set Account if the prize is a Programmable NFT.',
            ''
          ]
        },
        {
          name: 'creator',
          isMut: true,
          isSigner: false
        },
        {
          name: 'winner',
          isMut: false,
          isSigner: false
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Token Program Interface.']
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Associated Token Account Program.']
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Metaplex Token Metadata Program.']
        },
        {
          name: 'authRulesProgram',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Metaplex Token Auth Rules Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: [
            'The Metaplex Bubblegum Program.',
            'The Account Compression Program.',
            'The No Op Program.',
            'The Rent Sysvar.'
          ]
        },
        {
          name: 'instructions',
          isMut: false,
          isSigner: false,
          isOptional: true,
          docs: ['The Instructions Sysvar.']
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
        },
        {
          name: 'compressedArgs',
          type: {
            option: {
              defined: 'CompressedArgs'
            }
          }
        }
      ]
    },
    {
      name: 'collectProceeds',
      accounts: [
        {
          name: 'config',
          isMut: false,
          isSigner: false,
          docs: ['The global [`Config`].']
        },
        {
          name: 'raffle',
          isMut: false,
          isSigner: false,
          docs: [
            'The [`Raffle`] Account for which we are going to buy a ticket.'
          ]
        },
        {
          name: 'proceedsMint',
          isMut: false,
          isSigner: false
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false,
          docs: ['The vault where proceeds of the [`Raffle`] are stored.']
        },
        {
          name: 'creatorProceeds',
          isMut: true,
          isSigner: false,
          docs: ["The destination for the [`Raffle`] creator's proceeds."]
        },
        {
          name: 'protocolProceeds',
          isMut: true,
          isSigner: false,
          docs: ["The destination for the [`Raffle`] protocol's proceeds."]
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true,
          docs: ['The creator of the [`Raffle`].']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program Interface.']
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
          isSigner: false,
          docs: [
            'The [`Raffle`] Account for which we are going to add a prize.'
          ]
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false,
          docs: [
            'The [`Entrants`] Account which contains ticket buyers for a certain [`Raffle`].'
          ]
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true,
          docs: ['The creator of the [`Raffle`].']
        }
      ],
      args: []
    },
    {
      name: 'closeRaffle',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false,
          docs: [
            'The [`Raffle`] Account for which we are going to add a prize.'
          ]
        },
        {
          name: 'proceeds',
          isMut: true,
          isSigner: false,
          docs: ['The vault where proceeds of the [`Raffle`] are stored.']
        },
        {
          name: 'creator',
          isMut: false,
          isSigner: true,
          docs: ['The creator of the [`Raffle`].']
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: 'config',
      docs: [
        'This is a global program configuration account.',
        'This account can only be initialized by the program upgrade authority,',
        'which means it can only be initialized by the program deployer or by the',
        'multisig to which the program upgrade authority gets transferred to.',
        '',
        'This account will hold information regarding protocol fees, and any other',
        'important values or configs which might be needed in the future.'
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            docs: ["The authority of the program's config."],
            type: 'publicKey'
          },
          {
            name: 'protocolFee',
            docs: [
              'The protocol fee for raffle tickets, denominated in basis points.'
            ],
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
      docs: [
        'This account represents a raffle and holds information necessary to validate,',
        'reveal winners and let them claim their prizes once the raffle ends.'
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            docs: ['The bump of the account, for signer purposes.'],
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
            docs: ['The pubkey of the creator of the raffle.'],
            type: 'publicKey'
          },
          {
            name: 'entrants',
            docs: [
              'The pubkey of the entrants account, which holds information about the entrants in the raffle.'
            ],
            type: 'publicKey'
          },
          {
            name: 'proceedsMint',
            docs: ['The pubkey of the SPL Token Mint of the proceeds.'],
            type: 'publicKey'
          },
          {
            name: 'randomness',
            docs: ['The randomness used to derive the winners of the raffle.'],
            type: {
              option: {
                array: ['u8', 32]
              }
            }
          },
          {
            name: 'totalPrizes',
            docs: ['The total number of prizes for the raffle.'],
            type: 'u32'
          },
          {
            name: 'claimedPrizes',
            docs: [
              'The amount of prizes for the raffle that have been claimed.'
            ],
            type: 'u32'
          },
          {
            name: 'endTimestamp',
            docs: [
              'The timestamp at which the raffle ends and winners can be revealed.'
            ],
            type: 'i64'
          },
          {
            name: 'ticketPrice',
            docs: ['The ticket price in native units.'],
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'prize',
      docs: ['This account represents a prize for a certain [`Raffle`].'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            docs: ['The bump of the account, for signer purposes.'],
            type: 'u8'
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 3]
            }
          },
          {
            name: 'prizeIndex',
            docs: ['The prize index.'],
            type: 'u32'
          },
          {
            name: 'raffle',
            docs: ['The [`Raffle`] that this prize is associated to.'],
            type: 'publicKey'
          },
          {
            name: 'mint',
            docs: [
              'The SPL Token Mint of the Token, Legacy or Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a Compressed NFT.'
            ],
            type: 'publicKey'
          },
          {
            name: 'metadata',
            docs: [
              'The Metadata Account of the Legacy or Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a SPL Token or Compressed NFT.'
            ],
            type: 'publicKey'
          },
          {
            name: 'edition',
            docs: [
              'The Edition Account of the Legacy or Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a SPL Token or Compressed NFT.'
            ],
            type: 'publicKey'
          },
          {
            name: 'tokenRecord',
            docs: [
              'The Token Record Account of the Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be an SPL Token, Legacy or Compressed NFT.'
            ],
            type: 'publicKey'
          },
          {
            name: 'authorizationRules',
            docs: [
              'The Authorization Rule Set Account of the Programmable NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be an SPL Token, Legacy or Compressed NFT.'
            ],
            type: 'publicKey'
          },
          {
            name: 'merkleTree',
            docs: [
              'The Merkle Tree of the Compressed NFT Prize.',
              '',
              'If this value is set, the Prize CANNOT be a SPL Token, Legacy or Programmable NFT.'
            ],
            type: 'publicKey'
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
      name: 'CompressedArgs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'root',
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'dataHash',
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'creatorHash',
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'nonce',
            type: 'u64'
          },
          {
            name: 'index',
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'AddPrizeArgs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'prizeIndex',
            docs: [
              'The index of the prize, derived from [`Raffle`] `total_prizes`.',
              '',
              '[`Raffle`]: crate::state::Raffle'
            ],
            type: 'u32'
          },
          {
            name: 'amount',
            docs: ['The amount of the prize to add.'],
            type: 'u64'
          },
          {
            name: 'prizeType',
            docs: ['The type of the prize to add.'],
            type: {
              defined: 'PrizeType'
            }
          }
        ]
      }
    },
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
    },
    {
      name: 'PrizeType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Token'
          },
          {
            name: 'Compressed',
            fields: [
              {
                defined: 'CompressedArgs'
              }
            ]
          },
          {
            name: 'Legacy'
          },
          {
            name: 'Programmable'
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
          name: 'proceedsMint',
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
      name: 'RaffleClosed',
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
        },
        {
          name: 'mint',
          type: 'publicKey',
          index: false
        },
        {
          name: 'metadata',
          type: 'publicKey',
          index: false
        },
        {
          name: 'tokenRecord',
          type: 'publicKey',
          index: false
        },
        {
          name: 'merkleTree',
          type: 'publicKey',
          index: false
        }
      ]
    },
    {
      name: 'TicketBought',
      fields: [
        {
          name: 'raffle',
          type: 'publicKey',
          index: false
        },
        {
          name: 'buyer',
          type: 'publicKey',
          index: false
        },
        {
          name: 'index',
          type: 'u32',
          index: false
        }
      ]
    },
    {
      name: 'PrizeClaimed',
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
          name: 'ticketIndex',
          type: 'u32',
          index: false
        },
        {
          name: 'amount',
          type: 'u64',
          index: false
        },
        {
          name: 'winner',
          type: 'publicKey',
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
      name: 'InvalidTicketAmount',
      msg: 'Invalid ticket amount. Must not be greater than 20.'
    },
    {
      code: 6011,
      name: 'TokenAccountNotOwnedByWinner',
      msg: 'Ticket account not owned by winner'
    },
    {
      code: 6012,
      name: 'TicketHasNotWon',
      msg: 'Ticket has not won'
    },
    {
      code: 6013,
      name: 'UnclaimedPrizes',
      msg: 'Unclaimed prizes'
    },
    {
      code: 6014,
      name: 'InvalidRecentBlockhashes',
      msg: 'Invalid recent blockhashes'
    },
    {
      code: 6015,
      name: 'OnlyCreatorCanClaimNoEntrantRafflePrizes',
      msg: 'Only the creator can claim no entrant raffle prizes'
    },
    {
      code: 6016,
      name: 'InvalidTreasuryTokenAccountOwner',
      msg: 'Invalid treasury token account owner'
    },
    {
      code: 6017,
      name: 'PrizeMintNotProvided',
      msg: 'The prize token mint account was not provided'
    },
    {
      code: 6018,
      name: 'PrizeTokenAccountNotProvided',
      msg: 'The prize token account was not provided'
    },
    {
      code: 6019,
      name: 'SourceTokenAccountNotProvided',
      msg: 'The source token account was not provided'
    },
    {
      code: 6020,
      name: 'PrizeEditionNotProvided',
      msg: 'The prize edition account was not provided'
    },
    {
      code: 6021,
      name: 'PrizeMetadataNotProvided',
      msg: 'The prize metadata account was not provided'
    },
    {
      code: 6022,
      name: 'PrizeTokenRecordNotProvided',
      msg: 'The prize token record account was not provided'
    },
    {
      code: 6023,
      name: 'SourceTokenRecordNotProvided',
      msg: 'The source token record account was not provided'
    },
    {
      code: 6024,
      name: 'TokenProgramNotProvided',
      msg: 'The token program account was not provided'
    },
    {
      code: 6025,
      name: 'AssociatedTokenProgramNotProvided',
      msg: 'The associated token program account was not provided'
    },
    {
      code: 6026,
      name: 'MetadataProgramNotProvided',
      msg: 'The metadata program account was not provided'
    },
    {
      code: 6027,
      name: 'AuthorizationRulesProgramNotProvided',
      msg: 'The authorization rules program account was not provided'
    },
    {
      code: 6028,
      name: 'AuthorizationRuleNotProvided',
      msg: 'The authorization rule set account was not provided'
    },
    {
      code: 6029,
      name: 'InstructionsSysvarNotProvided',
      msg: 'The instructions sysvar account was not provided'
    },
    {
      code: 6030,
      name: 'WinnerTokenAccountNotProvided',
      msg: 'The winner token account was not provided'
    },
    {
      code: 6031,
      name: 'WinnerTokenRecordNotProvided',
      msg: 'The winner token record account was not provided'
    },
    {
      code: 6032,
      name: 'BubblegumProgramNotProvided',
      msg: 'The bubblegum program account was not provided'
    },
    {
      code: 6033,
      name: 'AccountCompressionProgramNotProvided',
      msg: 'The account compression program account was not provided'
    },
    {
      code: 6034,
      name: 'NoopProgramNotProvided',
      msg: 'The noop program account was not provided'
    },
    {
      code: 6035,
      name: 'PrizeMerkleTreeNotProvided',
      msg: 'The prize merkle tree account was not provided'
    },
    {
      code: 6036,
      name: 'PrizeMerkleTreeAuthorityNotProvided',
      msg: 'The prize merkle tree authority account was not provided'
    },
    {
      code: 6037,
      name: 'PrizeLeafOwnerNotProvided',
      msg: 'The prize leaf owner account was not provided'
    },
    {
      code: 6038,
      name: 'PrizeLeafDelegateNotProvided',
      msg: 'The prize leaf owner account was not provided'
    },
    {
      code: 6039,
      name: 'MerkleProofNotProvided',
      msg: 'The merkle proof was not provided'
    },
    {
      code: 6040,
      name: 'CompressedArgsNotProvided',
      msg: 'The compressed args were not provided'
    },
    {
      code: 6041,
      name: 'InvalidArgument',
      msg: 'Invalid argument'
    },
    {
      code: 6042,
      name: 'OnlyCreatorCanClaimInvalidWinnerDraw',
      msg: 'Only the creator can claim invalid winner draw'
    },
    {
      code: 6043,
      name: 'InvalidWinner',
      msg: 'Invalid winner'
    }
  ]
};
