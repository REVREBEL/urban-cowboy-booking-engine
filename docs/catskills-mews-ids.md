# Urban Cowboy Lodge Catskills — confirmed Mews identifiers

These identifiers are non-secret Mews entity IDs used to bind the custom booking engine to the Catskills property. The registered `MEWS_CLIENT` string remains deployment configuration and is not stored here.

## Property / booking configuration

| Entity | ID |
| --- | --- |
| Booking Engine Configuration | `4725ace3-6b93-439f-a549-b4bc00ae1d10` |
| Hotel / Enterprise | `8bd38131-c371-4625-9c29-b10600705d34` |
| Adult age category | `8f3ceb39-5c40-417a-b9a5-b106007064f8` |
| Child age category | `db093f0b-738e-4afe-9191-b106007065ff` |
| Mews subscription reference | `16703` |

The subscription reference is retained for human/account reference only. It is not sent in Booking Engine API requests.

## Fee / system products

| Source label | ID |
| --- | --- |
| `PET_FREE` | `c74edf03-043c-4217-adbd-b124016a55ae` |
| Resort Fee | `bdaf2c3a-baf7-41c6-aecb-b11e016a147e` |

`PET_FREE` is preserved exactly as supplied until the source Mews label is verified. These IDs are classified as system fees and are excluded from the generic guest-selectable add-on list. Their actual application remains controlled by Mews / booking policy rather than being invented client-side.

## Guest add-ons

| Add-on | ID |
| --- | --- |
| Flower Bouquet | `d8009b60-0580-49e7-a5dd-b12401713848` |
| Hummus & Crudités | `d4e2bfdd-f01f-4177-b366-b12401712a25` |
| Let's Eat! Chocolate Truffles | `41f8b399-a303-40ac-bbfc-b124016e6b85` |
| Welcome Wine! | `cad13cb9-752d-49e8-b5d3-b124016d3aa8` |

## Rate groups

| Rate group | ID |
| --- | --- |
| Flexible | `6f436522-b845-4535-b830-b106007064f7` |
| Tax Exempt Rate | `1df99a61-6b0e-4f0d-84de-b1ca016aa113` |
| Package | `5c4664c1-b4e8-46a6-9f09-b4ce00e3eaab` |
| Non Refundable | `071793d0-e989-43d1-bfb0-b132010cf1d5` |
| Discounted Rates | `0bbce96f-ce84-4fd5-b61e-b13201147843` |
| Promotions | `349e8a80-f303-4bd6-a74c-b128017183df` |
| Complimentary Rate | `5e26f524-be0d-4246-850f-b14600fc009b` |
| Group Rate | `41578126-aeda-42ec-9490-b1500123f991` |

The app records these identities on shaped rates, but does not infer cancellation/deposit policy from the group name. Settlement/payment behavior continues to come from the Mews rate-group response and final reservation quote.

## Remaining durable bindings

The missing identifiers are the production Mews `RoomCategoryId` values for each Catskills accommodation type. Run:

```bash
MEWS_CLIENT='Your Registered Client 1.0.0' npm run room-ids
```

and bind the returned UUIDs in `src/lib/roomMerchandising.ts`.
