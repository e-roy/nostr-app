"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

import { MoonIcon, SunIcon, X } from "lucide-react";
import useRelayStore from "@/store/relay-store";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [newRelay, setNewRelay] = useState("");
  const { allRelays, addRelay, removeRelay, resetRelays } = useRelayStore();

  const handleAddRelay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRelay) {
      addRelay(newRelay);
      setNewRelay("");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto flex gap-4">
        <div className="flex-1 min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="theme">Theme</Label>
                    <Button
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className={`w-48`}
                    >
                      <div className={`flex space-x-2 items-center`}>
                        {theme === "light" ? (
                          <SunIcon className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <MoonIcon />
                        )}
                        <span>
                          {theme === "light" ? <>Dark</> : <>Light</>}
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relay Settings */}
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold mb-4">Relays</h2>
                <div className="space-y-4">
                  <form onSubmit={handleAddRelay} className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="relay" className="sr-only">
                        Add Relay
                      </Label>
                      <Input
                        id="relay"
                        placeholder="wss://relay.example.com"
                        value={newRelay}
                        onChange={(e) => setNewRelay(e.target.value)}
                      />
                    </div>
                    <Button type="submit">Add Relay</Button>
                  </form>

                  <div className="space-y-2">
                    {allRelays.map((relay) => (
                      <div
                        key={relay}
                        className="flex items-center justify-between p-2 rounded-md bg-muted"
                      >
                        <span className="text-sm truncate flex-1">{relay}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRelay(relay)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={resetRelays}
                    className="w-full"
                  >
                    Reset to Default Relays
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
