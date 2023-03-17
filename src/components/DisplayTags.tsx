export const DisplayTags = ({ tags }: { tags: any }) => {
  return (
    <div className={`flex w-full flex-wrap`}>
      {tags.map((tag: any) => (
        <span key={tag}>
          {tag[0] === "t" && (
            <div
              key={tag}
              className={`px-2 mx-2 py-1 text-xs text-secondary-700 font-medium bg-secondary-200 rounded-full`}
            >
              {tag[0] === "t" && `${tag[1]}`}
            </div>
          )}
        </span>
      ))}
    </div>
  );
};
