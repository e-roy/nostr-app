"use client";

import { useParams } from "next/navigation";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRelayStore from "@/store/relay-store";
import { PostFeedCard } from "@/components/post/post-feed-card";
import { User } from "lucide-react";
import { NoteFeedCard } from "@/components/note/note-feed-card";

export default function UserPage() {
  const params = useParams<{ pubkey: string }>();
  const { subscribe, relayUrl, initialized } = useRelayStore();

  const [userProfile, setUserProfile] = useState<any>({});
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (newEvents.length > 0) {
        try {
          const profile = JSON.parse(newEvents[0].content);
          console.log("profile", profile);
          setUserProfile(profile);
        } catch (e) {
          console.error("Failed to parse profile:", e);
        }
      }
      setLoading(false);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  const getUserNoteEvents = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [1],
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
      setUserNotes(newEvents);
      setLoading(false);
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
      setUserArticles(newEvents);
      setLoading(false);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    // Only fetch data when the store is initialized and we have a relay URL
    if (initialized && relayUrl) {
      setLoading(true);
      getProfileEvents();
      getUserNoteEvents();
      getArticleEvents();
    }
  }, [initialized, relayUrl]);

  const shortenPubKey = (pubkey: string) => {
    return pubkey.slice(0, 6) + "..." + pubkey.slice(-8);
  };

  const PostSkeletons = () => {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow">
            <div className="animate-pulse h-4 bg-gray-200 w-1/4 mb-2"></div>
            <div className="animate-pulse h-4 bg-gray-200 w-1/2 mb-2"></div>
            <div className="animate-pulse h-4 bg-gray-200 w-1/4"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        className="h-52 sm:h-80 border"
        style={{
          backgroundImage: userProfile.banner
            ? `url(${userProfile.banner})`
            : "none",
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
            {userProfile.name || "Anonymous"}
            {userProfile.nip05 && ` - ${userProfile.nip05}`}
          </span>
          <span className={`ml-12`}>{shortenPubKey(params.pubkey)}</span>
        </div>
      </div>

      <div className={`my-8`}>
        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">
              {`Notes [${userNotes.length}]`}
            </TabsTrigger>
            <TabsTrigger value="blog">
              {`Blog [${userArticles.length}]`}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            {!initialized || loading ? (
              <PostSkeletons />
            ) : (
              <>
                {userNotes.length > 0 ? (
                  userNotes.map((note) => (
                    <div key={note.id + note.pubkey} className={`my-4`}>
                      <NoteFeedCard event={note} />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No notes found
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="blog">
            {!initialized || loading ? (
              <PostSkeletons />
            ) : (
              <>
                {userArticles.length > 0 ? (
                  userArticles.map((article) => (
                    <div key={article.id} className={`my-4`}>
                      <PostFeedCard event={article} />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No blog posts found
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
