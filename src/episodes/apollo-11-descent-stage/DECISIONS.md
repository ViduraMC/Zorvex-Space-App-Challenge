# Apollo 11 episode decisions

- Keep the story in the existing Moon episode player; do not add a second renderer or edit `src/engine/`.
- EASEP narrates the four-act story. The existing Apollo 11 descent-stage explorer launches it.
- The two additional NASA pages in the revised story brief (Apollo 11 CSM and Apollo 11 25th
  Anniversary) were explicitly approved on 14 Nov 2026. They are registered in the source page,
  this explorer's hologram source list, and `docs/RESOURCES.md`.
- The deployment control uses the NSSDCA distance of approximately 17 m south of the Lunar Module.
  The simplified scene sets the Lunar Module at `z = -17` and EASEP at `z = 0`.
- The panel slider's 90-degree target is the scene's north-referenced mapping for east/west.
  NASA's source supplies the directions, not a numeric angle.
- The game accepts a 1 m placement margin and a 10-degree panel-heading margin. These are play
  tolerances; the source reports an approximate distance and cardinal panel directions.
- The scene uses low-poly stand-ins for the Lunar Module, EASEP, astronauts, and surface equipment.
  Geometry is illustrative and does not add spacecraft facts.
- Camera height, Earth placement, and shortened animations are creative staging from the brief.
  No sound is added to exterior actions.
- Timeline dates that are only approximate use a calendar date or `NEXT LUNAR DAY`, not an
  invented clock time. The only direct quotations are the two quotes in the brief.
- `?act=1` through `?act=4` starts local testing at that act and continues through the ending;
  without a valid value, the complete story plays in order.
- Sinhala and Tamil episode text is still incomplete and requires review by fluent speakers.
- Browser verification, mobile/touch review, keyboard review, and the Fun Checklist remain required
  before calling the expanded episode release-ready.
