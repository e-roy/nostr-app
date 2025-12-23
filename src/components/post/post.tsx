import { type Event } from "nostr-tools";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { PostHeader } from "./post-header";
import { PostContent } from "./post-content";
import { getTagValues } from "@/utils";
import { DisplayTags } from "../DisplayTags";

interface PostProps {
  readonly event: Event;
}

export function Post({ event }: PostProps) {
  return (
    <Card>
      <CardContent className="space-y-8">
        <PostHeader
          event={event}
          pubkey={event.pubkey}
          timestamp={new Date(event.created_at * 1000)}
        />
        <div>
          <h2 className="text-4xl font-bold hover:text-primary transition-colors text-center">
            {getTagValues("title", event.tags) || "Untitled"}
          </h2>
        </div>
        <div className={`px-12`}>
          <DisplayTags tags={event.tags} />
        </div>
        <div className="px-12">
          {getTagValues("image", event.tags) && (
            <ImageWithFallback
              className="w-full rounded-sm my-6"
              src={getTagValues("image", event.tags)}
              alt={getTagValues("title", event.tags) || "Post image"}
            />
          )}
        </div>

        <PostContent content={event.content} />
      </CardContent>
    </Card>
  );
}
