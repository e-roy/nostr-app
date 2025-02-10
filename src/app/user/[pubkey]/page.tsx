"use client";

import { useParams } from "next/navigation";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useRelayStore from "@/store/relay-store";

// import { DUMMY_PROFILE_API } from "@/lib/constants";
import { PostFeedCard } from "@/components/post/post-feed-card";
import { User } from "lucide-react";
import { NoteFeedCard } from "@/components/note/note-feed-card";

export default function UserPage() {
  const params = useParams<{ pubkey: string }>();
  const subscribe = useRelayStore((state) => state.subscribe);
  const relayUrl = useRelayStore((state) => state.relayUrl);

  const [userProfile, setUserProfile] = useState<any>({});

  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);

  const [events, setEvents] = useState<any[]>([]);

  const profilePubkey = nip19.decode(params.pubkey).data.toString();
  const getProfileEvents = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [0],
      authors: [profilePubkey],
    };

    const onEvent = (event: any) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length !== 0) {
        // setEvents((prev) => [...prev, ...newEvents]);
      }

      // console.log("onEOSE PROFILE", newEvents);
      let profile = JSON.parse(newEvents[0].content);
      console.log("profile", profile);

      setUserProfile(JSON.parse(newEvents[0].content));
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  const getUserNoteEvents = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [1],
      // "#e": [convertKey],
      authors: [profilePubkey],
      limit: 50,
    };

    const onEvent = (event: any) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length !== 0) {
        setEvents((prev) => [...prev, ...newEvents]);
      }

      console.log("getUserNoteEvents events 1", newEvents);
      // let eventId = newEvents[0].id;

      // let profile = JSON.parse(newEvents[0].content);
      // console.log("profile", profile);
      setUserNotes(newEvents);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  const getArticleEvents = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [30023],
      limit: 50,
      authors: [profilePubkey],
    };

    const onEvent = (event: any) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length !== 0) {
        setEvents((prev) => [...prev, ...newEvents]);
      }

      console.log("onEOSE events 30023", newEvents);
      // let profile = JSON.parse(newEvents[0].content);
      // console.log("profile", profile);
      setUserArticles(newEvents);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (relayUrl) {
      getProfileEvents();
      getUserNoteEvents();
      getArticleEvents();
    }
  }, [relayUrl]);

  const shortenPubKey = (pubkey: string) => {
    return pubkey.slice(0, 6) + "..." + pubkey.slice(-8);
  };

  return (
    <>
      <div
        className="h-52 sm:h-80 border"
        style={{
          backgroundImage: userProfile.banner
            ? `url(${userProfile.banner})`
            : "none",
          // backgroundColor: "#94a3b8",
          backgroundSize: userProfile.banner ? "cover" : "30%",
          backgroundPosition: "center center",
          backgroundRepeat: userProfile.banner ? "no-repeat" : "repeat",
        }}
      />
      <div className={`-mt-16 px-20 flex`}>
        <Avatar className={`rounded-full w-32 h-32`}>
          <AvatarImage
            src={userProfile.picture}
            alt={userProfile.name || "User"}
          />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <div className={`flex flex-col space-y-2`}>
          <span
            className={`mt-12 ml-8 px-4 py-1.5 rounded-full bg-white font-medium text-slate-800 text-xl border`}
          >
            {userProfile.name} - {userProfile.nip05}
          </span>
          <span className={`ml-12`}>{shortenPubKey(params.pubkey)}</span>
        </div>
      </div>

      <div className={`my-8`}>
        <Tabs defaultValue="blog">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blog"> {`Blog [20023]`}</TabsTrigger>
            <TabsTrigger value="notes"> {`Notes [1]`}</TabsTrigger>
          </TabsList>
          <TabsContent value="blog">
            {userArticles.map((article) => (
              <div key={article.id} className={`my-4`}>
                <PostFeedCard event={article} />
              </div>
            ))}
          </TabsContent>
          <TabsContent value="notes">
            {userNotes.map((note) => (
              <div key={note.id + note.pubkey} className={`my-4`}>
                <NoteFeedCard event={note} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
