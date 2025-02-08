"use client";

import { useParams } from "next/navigation";
import { nip19 } from "nostr-tools";
import { useCallback, useEffect, useState } from "react";
import { getTagValues, getTimeAndDate } from "@/utils";
import Link from "next/link";
import useRelayStore from "@/store/relay-store";

type AddressPointer = {
  identifier: string;
  pubkey: string;
  kind: number;
  relays: string[];
};

import { DisplayTags } from "@/components";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { DUMMY_PROFILE_API } from "@/lib/constants";

export default function UserPage() {
  const params = useParams<{ pubkey: string }>();
  const subscribe = useRelayStore((state) => state.subscribe);
  const relayUrl = useRelayStore((state) => state.relayUrl);

  const [showNav, setShowNav] = useState<"20023" | "1">("20023");

  // const [picture, setPicture] = useState<string>(
  //   DUMMY_PROFILE_API(params.pubkey)
  // );

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

  const handleBlogNav = useCallback(() => {
    setShowNav("20023");
  }, []);

  const handleNoteNav = useCallback(() => {
    setShowNav("1");
  }, []);

  const routeCachedEvent = (pubkey: string, tags: any) => {
    // setCachedEvent(event);

    const identifier = getTagValues("d", tags);

    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: pubkey,
      kind: 30023,
      relays: [relayUrl],
    };

    // console.log("addressPointer", addressPointer);
    // console.log("addressPointer", nip19.naddrEncode(addressPointer));

    return nip19.naddrEncode(addressPointer);
  };

  const routeCachedNote = (pubkey: string) => nip19.noteEncode(pubkey);

  const shortenContent = (content: string) => {
    if (content.length > 120) {
      return content.slice(0, 120) + "...";
    }

    return content;
  };

  return (
    <>
      <div
        className="h-52 sm:h-80"
        style={{
          backgroundImage: userProfile.banner
            ? `url(${userProfile.banner})`
            : "none",
          backgroundColor: "#94a3b8",
          backgroundSize: userProfile.banner ? "cover" : "30%",
          backgroundPosition: "center center",
          backgroundRepeat: userProfile.banner ? "no-repeat" : "repeat",
        }}
      />
      <div className={`-mt-16 px-20 flex`}>
        <img
          src={userProfile.picture}
          alt="profile picture"
          className={`rounded-full w-32 h-32 bg-white`}
        />
        <div className={`flex flex-col`}>
          <span
            className={`mt-12 ml-8 px-4 py-1.5 rounded-full bg-white font-medium text-slate-800 text-xl border`}
          >
            {userProfile.name} - {userProfile.nip05}
          </span>
          <span className={`ml-12 text-slate-700`}>
            {shortenPubKey(params.pubkey)}
          </span>
        </div>
      </div>

      <div className={`my-8 px-4`}>
        <div className={`flex justify-center my-4`}>
          <span className="isolate inline-flex rounded-md shadow-md">
            <button
              type="button"
              className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
              onClick={handleBlogNav}
            >
              {`Blog [20023]`}
            </button>

            <button
              type="button"
              className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
              onClick={handleNoteNav}
            >
              {`Notes [1]`}
            </button>
          </span>
        </div>

        {showNav === "20023" &&
          userArticles.map((article) => {
            return (
              <div
                key={article.id}
                className={`border shadow-md p-4 rounded-lg my-4`}
              >
                <div className={`flex justify-between`}>
                  <Link
                    href={`/post/${routeCachedEvent(
                      article.pubkey,
                      article.tags
                    )}`}
                    prefetch={false}
                  >
                    <h3
                      className={`text-slate-900 text-xl font-semibold hover:text-primary-600`}
                    >
                      {getTagValues("title", article.tags) || "Untitled"}
                    </h3>
                  </Link>

                  <div className={`text-slate-500 text-xs`}>
                    {getTimeAndDate(article.created_at)}
                  </div>
                </div>
                <div className={`text-slate-600`}>
                  {getTagValues("summary", article.tags) || (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {shortenContent(article.content)}
                    </ReactMarkdown>
                  )}
                </div>
                <div className={`my-2`}>
                  <DisplayTags tags={article.tags} />
                </div>

                <div className={`text-xs text-slate-500`}>
                  {getTagValues("client", article.tags) || "no client"}
                </div>
              </div>
            );
          })}
        {showNav === "1" &&
          userNotes.map((note) => {
            return (
              <div
                key={note.id + note.pubkey}
                className={`border shadow-md p-4 rounded-lg my-4`}
              >
                <div className={`flex justify-between`}>
                  <Link
                    href={`/notes/${routeCachedNote(note.id)}`}
                    prefetch={false}
                  >
                    <div
                      className={`text-lg font-medium text-slate-700 hover:text-primary-600`}
                    >
                      {note.content}
                    </div>
                  </Link>

                  <div className={`text-slate-500 text-xs`}>
                    {getTimeAndDate(note.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
