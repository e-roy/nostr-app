"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Filter, Event } from "nostr-tools";
import useRelayStore from "@/store/relay-store";
import { PostFeedCard } from "@/components/post/post-feed-card";
import { PostSkeletons } from "@/components/post-skeletons";
import { LoaderCircle } from "lucide-react";

export default function Home() {
  const { subscribe, relayUrl } = useRelayStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Helper function to deduplicate and sort events by created_at descending
  const deduplicateAndSortEvents = (arr: Event[]) =>
    Array.from(new Map(arr.map((e) => [e.id, e])).values()).sort(
      (a, b) => b.created_at - a.created_at
    );

  /**
   * Fetch events, optionally those older than `until` (a timestamp)
   */
  const getEvents = useCallback(
    (until?: number) => {
      const newEvents: Event[] = [];
      setLoading(true);

      const filter: Filter = {
        kinds: [30023],
        limit: 20,
        ...(until ? { until } : {}),
      };

      const onEvent = (event: Event) => {
        newEvents.push(event);
      };

      const onEOSE = () => {
        if (newEvents.length > 0) {
          setEvents((prev) =>
            deduplicateAndSortEvents([...prev, ...newEvents])
          );
        }
        // Always set loading to false once the fetch cycle is completed
        setLoading(false);
        setInitialLoading(false);
      };

      subscribe([relayUrl], filter, onEvent, onEOSE);
    },
    [relayUrl, subscribe]
  );

  // Fetch initial events when relayUrl becomes available
  useEffect(() => {
    if (relayUrl) {
      getEvents();
    }
  }, [relayUrl, getEvents]);

  // Set up IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (loading) return; // Prevent trigger if already fetching

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) {
          // Only fetch more if there are existing events
          if (events.length > 0) {
            // Get the oldest event (assuming sorted by created_at descending)
            const oldestEvent = events[events.length - 1];
            getEvents(oldestEvent.created_at);
          }
        }
      },
      {
        root: null, // relative to the viewport
        threshold: 1.0, // fully visible
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup: Unobserve the element to prevent memory leaks
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [events, getEvents, loading]);

  return (
    <div className="space-y-4 my-12">
      {initialLoading ? (
        <PostSkeletons />
      ) : (
        events.map((event) => (
          <PostFeedCard key={event.id} event={event} />
        ))
      )}
      <div ref={loadMoreRef} className="h-1" />
      {loading && (
        <div className="text-center py-2 flex justify-center items-center">
          <span className="animate-spin inline-block mr-2">
            <LoaderCircle />
          </span>
          <span className="">Loading more posts...</span>
        </div>
      )}
    </div>
  );
}
