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

## Production Room Type bindings

Mews exposes these lodging Room Types as `RoomCategoryId` values. In the application domain they are Room Type IDs.

| Room Type | Mews Room Type ID (`RoomCategoryId`) |
| --- | --- |
| Alpine Bathing Suite | `9cbb022a-742f-4abe-9586-b10600706caf` |
| Alpine Bathing Suite with Den | `7ed2f1d1-1bcc-4dd1-8ebf-b10600706caf` |
| Alpine Penthouse Bathing Suite | `33536114-501b-40e9-87f2-b10600706caf` |
| Cabin | `e90c2a72-1cf8-4246-84d7-b10600706caf` |
| Chalet | `87342626-a461-444b-9a72-b10600706caf` |
| Forest House King | `38cebace-6f26-47fd-b7e0-b1f1012d30a6` |
| Forest House Queen | `bce0e941-af9f-4239-8449-b1f101307a72` |
| Lodge 2 Bedroom | `be081636-bd06-4273-bdc3-b10600706caf` |
| Lodge 3 Bedroom Suite | `92bd10f2-58bf-4e9a-8985-b10600706caf` |
| Lodge King | `ea80fc33-3aa0-4a90-88db-b10600706caf` |
| Lodge Penthouse Suite | `1bcedebb-a880-4baf-86f3-b10600706caf` |
| Mountain View Haus 2 Bedroom | `81ecc428-8c85-405e-8607-b2a500e66429` |
| Mountain View Haus 4 Bedroom | `9f2f57b0-9533-46f0-9d9b-b282017b3741` |
| Opa's Cabin 2 Bedroom | `a2230bdd-1770-41b6-8932-b202001df350` |
| Opa's Cabin 4 Bedroom | `e26a0e14-0ce7-467d-a911-b1f1012b01b2` |
| Slide Mountain Haus 2 Bedroom | `d0961acc-145f-4ad9-a965-b1f1012e7f00` |
| Slide Mountain Haus 5 Bedroom | `d68e4504-7944-43a7-8e12-b1f1012d6350` |
| Slide Mountain Haus Double Queen | `1c035d90-e174-4af4-95a1-b1f1012ed296` |
| Walden Forest Bathing Suite | `c76c83ca-eeef-4c9a-80a5-b10600706caf` |
| Walden Forest Bathing Suite with Den | `a9deaf36-5ab1-47ce-ac68-b10600706caf` |
| Walden King | `2f42029c-44ea-4058-ab0e-b10600706caf` |
| Walden Sunrise Bathing Suite | `074257cb-3cce-4dc2-b74c-b10600706caf` |

These bindings are stored in `src/lib/roomMerchandising.ts` under `mewsRoomTypeIds`.

The Room Type Group relationship is not supplied by Mews and is maintained by the Cowboy domain/content layer. See `docs/accommodation-domain-model.md`.
