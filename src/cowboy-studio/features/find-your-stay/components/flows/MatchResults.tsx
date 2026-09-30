import { useState } from 'react';
import type {
  MatchInterest,
  RecommendationPreferences,
  RoomType,
  SearchCriteria
} from '../../../../types';
import { RoomsListCard } from '../../../../components/RoomsListCard';

interface Props {
  rooms: RoomType[];
  criteria: SearchCriteria;
  preferences: RecommendationPreferences;
  onBack: () => void;
  onBrowseAll: () => void;
  onSelectRoom: (room: RoomType) => void;
  onOpenRoomDetails: (room: RoomType) => void;
}

const INTEREST_LABELS: Record<MatchInterest, string> = {
  iconTub: 'an iconic copper-tub soak',
  outdoorSoak: 'bathing outside',
  ownPlace: 'a place of your own',
  scenic: 'mountain and forest views',
  simpleCozy: 'something simple and cozy',
  social: 'room to gather'
};

function listChoices(interests: [MatchInterest, MatchInterest?]) {
  const labels = interests
    .filter((interest): interest is MatchInterest => Boolean(interest))
    .map((interest) => INTEREST_LABELS[interest]);
  return labels.length === 2 ? `${labels[0]} and ${labels[1]}` : labels[0];
}

function partyCopy(room: RoomType, preferences: RecommendationPreferences) {
  const withDog = preferences.dog && room.isDogFriendly ? ' Your dog is welcome, too.' : '';
  switch (preferences.party) {
    case 'partner':
      return {
        phrase: 'a romantic couples’ weekend',
        heading: 'Just Right for Two',
        detail: `The privacy, atmosphere, and ${room.bedType.toLowerCase()} setup make this an easy place for two people to disappear for a few days.${withDog}`
      };
    case 'friends':
      return {
        phrase: 'a friends’ getaway with time to reconnect',
        heading: 'Made for Catching Up',
        detail: `${room.name} gives your group a comfortable home base between meals, drinks, and time outside.${withDog}`
      };
    case 'family':
      return {
        phrase: 'a family stay with room to catch up and gather',
        heading: 'Room for Your People',
        detail: `${room.name} sleeps up to ${room.maxGuests}, with the scale and shared-space details that make a family trip feel easy.${withDog}`
      };
    case 'solo':
      return {
        phrase: 'a quiet solo escape on your own schedule',
        heading: 'Easy on Your Own',
        detail: `The room gives you a private, comfortable base for slowing down and doing the Catskills entirely your way.${withDog}`
      };
  }
}

function interestCopy(room: RoomType, interests: [MatchInterest, MatchInterest?]) {
  const chosen = interests.filter((interest): interest is MatchInterest => Boolean(interest));
  const facts = chosen.map((interest) => {
    switch (interest) {
      case 'iconTub':
        return room.features.find((feature) => /tub|bath/i.test(feature)) ?? room.soakHighlight;
      case 'outdoorSoak':
        return room.features.find((feature) => /outdoor|cedar|soak/i.test(feature)) ?? room.soakHighlight;
      case 'ownPlace':
        return room.features.find((feature) => /living|kitchen|bedroom|private/i.test(feature)) ?? `${room.squareFeet} square feet of private space`;
      case 'scenic':
        return room.features.find((feature) => /view|mountain|forest|deck|balcony/i.test(feature)) ?? room.soakHighlight;
      case 'simpleCozy':
        return room.features.find((feature) => /stove|fireplace|desk|robe/i.test(feature)) ?? room.tagline;
      case 'social':
        return room.features.find((feature) => /living|bar|porch|fireplace/i.test(feature)) ?? room.tagline;
    }
  });
  return facts.join(' and ');
}

function seasonalCopy(checkIn: string, room: RoomType) {
  const month = Number(checkIn.slice(5, 7));
  if (month === 12 || month <= 2) {
    return `In winter, details like ${room.features.find((feature) => /heated|fire|stove/i.test(feature)) ?? room.soakHighlight} make the return from the cold even better.`;
  }
  if (month <= 5) return `In spring, ${room.soakHighlight.toLowerCase()} keeps the stay connected to the waking Catskills landscape.`;
  if (month <= 8) return `In summer, ${room.soakHighlight.toLowerCase()} makes the most of long days and mountain air.`;
  return `In fall, ${room.soakHighlight.toLowerCase()} puts the changing Catskills landscape at the center of the stay.`;
}

function MatchReasonCard({
  room,
  criteria,
  preferences
}: {
  room: RoomType;
  criteria: SearchCriteria;
  preferences: RecommendationPreferences;
}) {
  const [saved, setSaved] = useState(false);
  const party = partyCopy(room, preferences);
  const choices = listChoices(preferences.interests);

  const share = async () => {
    const data = { title: room.name, text: room.tagline, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <aside className="flex h-full min-h-[320px] flex-col border border-[#8C2340] bg-[#FAF9F9] p-4 text-[#4E332D] sm:p-5">
      <img src="/assets/labels/top_match.svg" alt="Top Match" className="h-auto w-28 object-contain" />

      <p className="mx-auto mt-4 max-w-[18rem] font-editorial text-xs leading-[1.45]">
        This room feels made for {party.phrase}, with {choices} shaping the match.
      </p>

      <div className="mt-4 border-t border-[#8C2340]/45 pt-4">
        <div className="flex items-center gap-2">
          <img src="/assets/icons/ui/Left Hand Pointing.svg" alt="" aria-hidden="true" className="h-7 w-14 object-contain" />
          <h2 className="font-brothers text-lg font-bold uppercase leading-none text-[#8C2340]">
            You’ll Love It Because …
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <section>
          <h3 className="font-bianco text-xs font-bold text-[#8C2340]">{party.heading}</h3>
          <p className="mt-1 font-editorial text-[11px] leading-[1.45]">{party.detail}</p>
        </section>
        <section>
          <h3 className="font-bianco text-xs font-bold text-[#8C2340]">Your Choices, Reflected</h3>
          <p className="mt-1 font-editorial text-[11px] leading-[1.45]">
            You chose {choices}; this room answers with {interestCopy(room, preferences.interests).toLowerCase()}. {seasonalCopy(criteria.checkIn, room)}
          </p>
        </section>
      </div>

      <div className="mt-auto flex justify-end gap-2 pt-5">
        <button type="button" onClick={share} className="rounded-full border border-[#4E332D] px-4 pb-1.5 pt-2 font-bianco text-[10px] font-bold uppercase tracking-[1px] hover:bg-[#4E332D] hover:text-[#FAF9F9]">
          Share
        </button>
        <button type="button" aria-pressed={saved} onClick={() => setSaved((value) => !value)} className="rounded-full bg-[#8C2340] px-4 pb-1.5 pt-2 font-bianco text-[10px] font-bold uppercase tracking-[1px] text-[#FAF9F9] hover:bg-[#6E1B32]">
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </aside>
  );
}

export function MatchResults({
  rooms,
  criteria,
  preferences,
  onBack,
  onBrowseAll,
  onSelectRoom,
  onOpenRoomDetails
}: Props) {
  const [top, ...alternates] = rooms;

  return (
    <section className="min-h-screen bg-[#EBE8E0] pb-24 pt-10">
      <div className="booking-shell !max-w-[1800px]">
        <button type="button" onClick={onBack} className="mb-10 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#6B6259] hover:text-[#4E332D]">
          ← Adjust Preferences
        </button>

        <header className="mb-8">
          <div className="mb-5 flex items-center gap-3 text-[#9A5636]" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-current" />
            <span className="h-px w-8 bg-current" />
            <span className="size-2.5 rounded-full bg-current" />
            <span className="h-px w-8 bg-current" />
            <span className="size-2.5 rounded-full bg-current" />
          </div>
          <p className="mb-4 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">Step 1 of 3</p>
          <h1 className="font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">Your Matches</h1>
        </header>

        {top ? (
          <>
            <div className="grid w-full items-stretch gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(20rem,1fr)]">
              <RoomsListCard
                room={top}
                color="paper"
                layout="left"
                onSelectRoom={onSelectRoom}
                onOpenRoomDetails={onOpenRoomDetails}
                className="h-full"
              />
              <MatchReasonCard room={top} criteria={criteria} preferences={preferences} />
            </div>

            {alternates.length > 0 && (
              <div className="mt-10">
                <h2 className="font-desert text-2xl font-bold uppercase tracking-[1px] text-[#4E332D] md:text-3xl">
                  Other High Matching Options
                </h2>
                <div className="mt-5 space-y-5">
                  {alternates.slice(0, 2).map((room, index) => (
                    <RoomsListCard
                      key={room.id}
                      room={room}
                      color="paper"
                      layout={index % 2 === 0 ? 'left' : 'right'}
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-10 text-center">
            <h2 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">No exact matches yet</h2>
            <p className="mx-auto mt-3 max-w-lg font-editorial text-sm text-[#6B6259]">Try adjusting your party or preference selections, or browse every available room.</p>
          </div>
        )}

        <div className="mt-10 border-t border-[#4E332D]/20 pt-6 text-center">
          <button type="button" onClick={onBrowseAll} className="font-bianco text-xs font-bold uppercase tracking-[2px] text-[#4E332D] underline underline-offset-4">
            View All Rooms
          </button>
        </div>
      </div>
    </section>
  );
}
