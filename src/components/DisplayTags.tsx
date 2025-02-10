import { Badge } from "@/components/ui/badge";

export const DisplayTags = ({ tags }: { tags: any }) => {
  return (
    <div className={`flex w-full flex-wrap gap-2`}>
      {tags.map((tag: any) => {
        if (tag[0] !== "t") return null;
        return (
          <span key={tag}>
            <Badge>{tag[0] === "t" && `${tag[1]}`}</Badge>
          </span>
        );
      })}
    </div>
  );
};
