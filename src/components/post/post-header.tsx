"use client";
import { useEffect, useState } from "react";
import { type Event, nip19 } from "nostr-tools";
import useRelayStore from "@/store/relay-store";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { getTagValues } from "@/utils";

interface PostHeaderProps {
  event: Event;
  pubkey: string;
  timestamp: Date;
}

interface UserProfile {
  picture?: string;
  name?: string;
  nip05?: string;
  npub?: string;
}

export function PostHeader({ event, pubkey, timestamp }: PostHeaderProps) {
  const subscribe = useRelayStore((state) => state.subscribe);
  const relayUrl = useRelayStore((state) => state.relayUrl);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    npub: "",
  });

  const getProfileEvent = () => {
    const newEvents: Event[] = [];

    const filter = {
      kinds: [0],
      authors: [pubkey],
    };

    const onEvent = (event: Event) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length > 0) {
        setUserProfile(JSON.parse(newEvents[0].content));
      }
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (pubkey) getProfileEvent();
  }, [pubkey, relayUrl, subscribe]);

  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  const shortenPubKey = (pubkey: string) => {
    if (!pubkey) return "";
    return pubkey.slice(0, 6) + "..." + pubkey.slice(-8);
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarImage
          src={userProfile.picture}
          alt={userProfile.name || "User"}
        />
        <AvatarFallback>
          <User />
        </AvatarFallback>
      </Avatar>
      <div className="flex justify-between w-full">
        <a href={`/user/${nip19.npubEncode(pubkey)}`}>
          <div className="flex items-center gap-2 hover:underline">
            <span className="font-bold">{userProfile.name || "Anon"}</span>
            <span className="text-muted-foreground">
              {userProfile.nip05 ||
                shortenPubKey(userProfile.npub || "") ||
                pubkey.slice(0, 8) + "..."}
            </span>
          </div>
        </a>

        <div className={`flex flex-col`}>
          <span className="text-muted-foreground">{timeAgo}</span>
          <span
            className={`my-auto italic text-sm text-muted-foreground text-right`}
          >
            {getTagValues("client", event.tags) || "unknown client"}
          </span>
        </div>
      </div>
    </div>
  );
}
