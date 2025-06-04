"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeletons = () => {
  const skeletonData = useMemo(
    () =>
      Array.from({ length: 3 }, () => ({
        key: Math.random().toString(36).substring(2, 11),
      })),
    []
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {skeletonData.map(({ key }) => (
        <Card key={key}>
          <CardContent>
            <div className="flex items-start gap-4 w-full">
              <Skeleton className="rounded-full h-10 w-10" />
              <div className="flex justify-between w-full">
                <div className="flex pt-1 gap-2 w-full">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>

                <div className={`flex flex-col space-y-4`}>
                  <Skeleton className="h-4 w-28" />

                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
