
## 1. Matching path


**DATES + OCCUPANCY**
→ remove anything that cannot physically accommodate the reservation

**AGE / CHILDREN**
→ if children are actually on the reservation, remove 21+ Alpine and Walden inventory

**DOG = YES / NO**
→ Yes acts as a hard eligibility filter
→ No does not penalize dog-friendly rooms

**PARTY TYPE**
Partner | Friends | Family | Solo
→ soft ranking modifier, not a hard filter

**INTEREST 1 + OPTIONAL INTEREST 2**
Connection with Nature | Indoor Sanctuaries | Minimal Distractions | Scenic Mountain Views | Simple Comforts | Spaces for Connection | Spaces to Gather | Your Own Hideaway

**RANK ALL ELIGIBLE ROOM TYPES**

**CHECK AVAILABILITY IN ORDER**

**DISPLAY FIRST 3 AVAILABLE**

So sold-out inventory never breaks the recommendation experience. It simply causes the engine to continue down the ordered list.

---

## 2. Proposed room-type matching matrix

These scores are **our recommendation logic**, not claims made by the hotel. `5` means defining match, `4` strong, `3` useful secondary fit, `1–2` weak, `0` no meaningful fit.

| Room Type                                | Partner | Friends | Family | Solo | Dog       | 21+  | Indoor Sanctuaries | Connection with Nature | Your Own Hideaway | Scenic Mountain Views | Simple Comforts |
| ---------------------------------------- | ------: | ------: | -----: | ---: | --------- | ---- | -------: | -----------: | --------: | -----: | ------------: |
| **Alpine Bathing Suite**                 |       5 |       3 |      2 |    4 | Yes       | Yes  |        5 |            0 |         0 |      5 |             2 |
| **Alpine Bathing Suite with Den**        |       5 |       3 |      2 |    3 | Yes       | Yes  |        5 |            0 |         0 |      5 |             1 |
| **Alpine Penthouse Bathing Suite**       |       5 |       3 |      2 |    3 | Yes       | Yes  |        5 |            0 |         0 |      5 |             1 |
| **Walden Forest Bathing Suite**          |       5 |       3 |      2 |    4 | Yes       | Yes  |        0 |            5 |         0 |      4 |             2 |
| **Walden Sunrise Bathing Suite**         |       5 |       3 |      2 |    3 | Yes       | Yes  |        0 |            5 |         0 |      5 |             1 |
| **Walden Forest Bathing Suite with Den** |       5 |       3 |      2 |    3 | **No**    | Yes  |        0 |            5 |         0 |      4 |             1 |
| **Walden King**                          |       4 |       3 |      2 |    5 | Yes       | Yes  |        0 |            0 |         0 |      4 |             5 |
| **Cabin**                                |       5 |       4 |      4 |    3 | Yes       | No   |        5 |            0 |         5 |      3 |             2 |
| **Chalet**                               |       5 |       4 |      5 |    2 | Yes       | No   |        0 |            5 |         5 |      4 |             2 |
| **Forest House Queen**                   |       4 |       3 |      3 |    5 | No*       | No   |        0 |            0 |         0 |      2 |             5 |
| **Forest House King**                    |       4 |       3 |      4 |    4 | No*       | No   |        0 |            0 |         0 |      4 |             4 |
| **Opa’s Cabin 2 Bedroom**                |       2 |       5 |      5 |    1 | Verify    | No   |        0 |            0 |         5 |      2 |             3 |
| **Opa’s Cabin 4 Bedroom**                |       1 |       5 |      5 |    0 | Verify    | No   |        0 |            0 |         5 |      2 |             2 |
| **Lodge Penthouse Suite**                |       5 |       3 |      4 |    2 | Yes       | No** |        5 |            0 |         2 |      5 |             1 |
| **Lodge 3 Bedroom Suite**                |       2 |       5 |      5 |    0 | Yes       | No** |        4 |            0 |         2 |      5 |             2 |
| **Lodge 2 Bedroom**                      |       2 |       5 |      5 |    1 | Yes       | No** |        0 |            0 |         1 |      4 |             3 |
| **Lodge King**                           |       4 |       3 |      4 |    5 | Yes       | No** |        0 |            0 |         0 |      3 |             5 |
| **Slide Mountain Haus 5 Room**           |       0 |       5 |      5 |    0 | Yes       | No   |        0 |            0 |         5 |      3 |             3 |
| **Slide Mountain Haus 2 Bedroom**        |       1 |       5 |      5 |    0 | No        | No   |        0 |            0 |         3 |      3 |             4 |
| **Slide Mountain Haus Double Queen**     |       2 |       5 |      4 |    2 | Verify*** | No   |        0 |            0 |         0 |      4 |             5 |
| **Mountain View Haus 2 Bedroom**         |       2 |       5 |      5 |    0 | Verify    | No   |        0 |            0 |         5 |      5 |             3 |
| **Mountain View Haus 4 Bedroom**         |       1 |       5 |      5 |    0 | Verify    | No   |        0 |            0 |         5 |      5 |             2 |

### Additional preference behavior

The eight guest-facing choices use a mix of the existing score matrix and verified room features:

- **Connection with Nature** uses the former outdoor-soak score ladder.
- **Indoor Sanctuaries** uses the former iconic-indoor-tub score ladder.
- **Scenic Mountain Views** uses the existing scenic-view score ladder.
- **Simple Comforts** uses the existing simple/cozy score ladder.
- **Your Own Hideaway** uses the existing independent/own-place score ladder.
- **Spaces for Connection** is feature-driven: a Room Type must have a verified separate living room or lounge space.
- **Spaces to Gather** is feature-driven: a Room Type must have a verified full kitchen.
- **Minimal Distractions** is group-driven: the Room Type Group must be marked `away-from-core` and `enhanced` privacy. It is not derived from room size, price, or Simple Comforts.

A separate living room and a full kitchen are independent signals. A Room Type may match one, both, or neither.


### Minimal Distractions group rule

This preference describes **setting**, not an amenity. It is evaluated at the Room Type Group level:

```text
distanceFromLodgeFeet >= 1000
AND
coreProximity = away-from-core
AND
privacyLevel = enhanced
```

Using the property KML, the immediate Lodge cluster is Walden (156 ft), Chalet (162 ft), Cabin (183 ft), and Alpine (288 ft). The separated groups are Mountain View (1,262 ft), Slide Mountain (1,323 ft), Forest House (1,668 ft), and Opa's (1,844 ft). Those four separated groups qualify when `privacyLevel = enhanced`.

A few implementation caveats matter. The current Walden copy explicitly says the Forest Bathing Suite with Den is its only non-dog-friendly room style, while the other listed Walden types are dog-friendly. Alpine's three types are dog-friendly and 21+. Cabin, Chalet and the four Lodge types are published as dog-friendly. Slide says the full Haus is dog-friendly while the 2 Bedroom is not unless the full Haus is booked. The current canonical Forest House page says those rooms are not dog-friendly. Opa’s and Mountain View currently don't state a dog policy in their published copy, so I would **not silently code them as dog-friendly** until the CRS/property confirms it. ([Urban Cowboy][2])

**The Lodge allows families, but booking requires an adult 21+.** That is different from Alpine/Walden, where the room itself is expressly 21+. ([Urban Cowboy][3])

---

# 3. What a path actually looks like

Using your example:

### PARTNER + NO DOG + CONNECTION WITH NATURE

The ranked fallback path would be:

**1. Walden Forest Bathing Suite**
The archetypal Cowboy outdoor connection.

**2. Walden Sunrise Bathing Suite**
Same defining ritual with an even stronger scenic component.

**3. Walden Forest Bathing Suite with Den**
Outdoor bathing plus more room to lounge.

**4. Chalet**
Outdoor cedar tub, but shifts into the larger standalone/private experience.

The booking engine checks them in that order.

If #1 is sold out, #2 moves up.
If #1 and #2 are sold out, the guest sees #3 and #4.
If all Walden inventory is sold, Chalet becomes the strongest remaining Connection with Nature match.

Only the **first three available** are presented.

For:

### PARTNER + DOG + CONNECTION WITH NATURE

Dog eligibility removes the Walden Den automatically:

**1. Walden Forest Bathing Suite**
**2. Walden Sunrise Bathing Suite**
**3. Chalet**

That gives you exactly three clean recommendations without changing the guest's interest logic.

---

# 4. Single-interest fallback families

This is the other piece I would give the developer. These are the broad product ladders before party and dog modifiers are applied.

| Interest          | Primary room-type ladder                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **INDOOR SANCTUARIES**      | Alpine Bathing Suite → Alpine Bathing Suite with Den → Alpine Penthouse Bathing Suite → Lodge Penthouse Suite → Cabin → Lodge 3 Bedroom Suite                                                                                                                                                                                                                                 |
| **CONNECTION WITH NATURE**  | Walden Forest Bathing Suite → Walden Sunrise Bathing Suite → Walden Forest Bathing Suite with Den → Chalet                                                                                                                                                                                                                                                                    |
| **YOUR OWN HIDEAWAY**  | Cabin → Chalet → Mountain View Haus 2 Bedroom → Opa’s Cabin 2 Bedroom → Slide Mountain Haus 5 Room → Mountain View Haus 4 Bedroom → Opa’s Cabin 4 Bedroom → Slide Mountain Haus 2 Bedroom                                                                                                                                                                                     |
| **SCENIC MOUNTAIN VIEWS**  | Walden Sunrise Bathing Suite → Alpine Bathing Suite with Den → Alpine Penthouse Bathing Suite → Lodge Penthouse Suite → Alpine Bathing Suite → Mountain View Haus 2 Bedroom → Mountain View Haus 4 Bedroom → Lodge 3 Bedroom Suite → Walden Forest Bathing Suite → Forest House King → Chalet → Slide Mountain Haus Double Queen → Walden King → Lodge 2 Bedroom → Lodge King |
| **SIMPLE COMFORTS** | Slide Mountain Haus Double Queen → Forest House Queen → Walden King → Lodge King → Forest House King → Slide Mountain Haus 2 Bedroom → Opa’s Cabin 2 Bedroom → Lodge 2 Bedroom                                                                                                                                                                                                |
| **SPACES FOR CONNECTION** | Feature-driven: Room Types with a verified separate living room or lounge space. |
| **SPACES TO GATHER** | Feature-driven: Room Types with a verified full kitchen. |
| **MINIMAL DISTRACTIONS** | KML-measured distance of at least 1,000 ft from The Main Lodge, plus enhanced privacy. |

Then **party type reshuffles that ladder**.

For example, `Simple Comforts` for **Solo** would move Forest House Queen / Walden King / Lodge King to the top, whereas **Friends** would push Slide Double Queen / Slide 2 Bedroom upward.

---

# 5. Combined selections

This is where I would avoid manually maintaining separate tables.

If the guest chooses two interests, first look for room types that genuinely satisfy **both**.

### CONNECTION WITH NATURE + YOUR OWN HIDEAWAY

**Chalet** becomes the obvious #1 because it scores 5 + 5.

Then the engine can fall back to strong one-interest matches:

Walden Forest Bathing Suite
Walden Sunrise Bathing Suite
Cabin
Mountain View 2 Bedroom
Opa’s 2 Bedroom
etc.

### INDOOR SANCTUARIES + YOUR OWN HIDEAWAY

**Cabin** becomes #1 because it is both a standalone unit and an iconic indoor-tub room.

Then:

Lodge Penthouse Suite
Alpine Bathing Suite
Alpine Bathing Suite with Den
Chalet / Mountain View as own-place fallbacks

### CONNECTION WITH NATURE + SCENIC MOUNTAIN VIEWS

**Walden Sunrise Bathing Suite** becomes #1.

Then:

Walden Forest Bathing Suite
Walden Forest Bathing Suite with Den
Chalet

### YOUR OWN HIDEAWAY + SCENIC MOUNTAIN VIEWS

**Mountain View Haus 2 Bedroom / 4 Bedroom** become very strong.

For a Partner, the smaller 2 Bedroom moves ahead.
For Friends/Family, party size determines whether 2BR or 4BR is the better fit.

### SCENIC MOUNTAIN VIEWS + SIMPLE COMFORTS

Now you are deliberately steering away from the premium bathing suites:

Walden King
Forest House King
Slide Mountain Haus Double Queen
Lodge King

with party type deciding the precise order.

### INDOOR SANCTUARIES + CONNECTION WITH NATURE

There is **no single room type that truly delivers both**.

That is okay.

The engine should not pretend there is.

Instead, it should return the best expressions of each preference:

**Alpine Bathing Suite**
*For the iconic indoor soak*

**Walden Forest Bathing Suite**
*For bathing outside*

**Cabin or Chalet**
*The more private alternative*

That is actually a great opportunity for the match explanation to do some work.

---

# 6. The ranking formula I would use

I would make interests much more important than party type.

For a single preference:

`Interest Fit × 10 + Party Fit × 2`

For two preferences, don't simply add them. Reward the intersection:

`Interest A + Interest B + BOTH bonus + Party Fit`

Something along these lines:

**Both interests score 4–5:** +50 bonus
**One interest 4–5 and the other 2–3:** +20
**Only one selected interest meaningfully matches:** no bonus

That ensures:

**Connection with Nature + Your Own Hideaway → Chalet**

beats:

**Walden Forest Bathing Suite**

even though Walden may be the stronger pure Connection with Nature room.

---

## One final distinction I would build into the model

**Party type is preference. Guest count is eligibility.**

So `Family` itself should **not automatically remove Alpine/Walden**. A family could be three adult siblings traveling together.

If the actual booking search contains a child, *then* those 21+ room types disappear.

Likewise, `Friends` should not automatically push someone into a two-bedroom unit. If the reservation is two adults and they selected Indoor Sanctuaries, an Alpine Bathing Suite may still be exactly what they want.

That keeps the matcher smart without letting the quiz override actual booking facts.

And this gives us a very clean architecture:

> **Eligibility decides what CAN be booked.
> Interests decide what SHOULD be recommended.
> Availability decides which three the guest actually sees.**

That is the system I would build.

[1]: https://www.urbancowboy.com/catskills/lodging/alpine/?utm_source=chatgpt.com "Alpine — Urban Cowboy"
[2]: https://www.urbancowboy.com/catskills/lodging/walden "Walden — Urban Cowboy"
[3]: https://www.urbancowboy.com/catskills/lodging/the-lodge/?utm_source=chatgpt.com "The Lodge — Urban Cowboy"
