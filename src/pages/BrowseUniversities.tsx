import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Building2, Globe, MapPin, Search } from "lucide-react";

interface UniversityProfile {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
}

export default function BrowseUniversities() {
  const [profiles, setProfiles] = useState<UniversityProfile[]>([]);
  const [programCounts, setProgramCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Browse Universities | EduConnect";
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch published profiles
    const { data: profs } = await supabase
      .from("university_profiles")
      .select("id,name,description,location,website,logo_url")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    setProfiles(profs || []);

    // Fetch all published programs and count per university
    const { data: programs } = await supabase
      .from("university_programs")
      .select("id, university_id")
      .eq("is_published", true);

    const counts: Record<string, number> = {};
    (programs || []).forEach((p) => {
      counts[p.university_id] = (counts[p.university_id] || 0) + 1;
    });
    setProgramCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel("universities-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "university_profiles" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "university_programs" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      [p.name, p.location || "", p.description || ""].some((f) => f.toLowerCase().includes(q))
    );
  }, [profiles, search]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Browse Universities</h1>
          <p className="text-muted-foreground">Discover institutions and their programs in real time</p>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or description"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass">
                <CardContent className="h-40 animate-pulse" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((u) => (
              <Card key={u.id} className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {u.logo_url ? (
                      <img
                        src={u.logo_url}
                        alt={`${u.name} logo`}
                        className="h-10 w-10 rounded object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{u.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {u.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{u.location}</span>
                        )}
                        <Badge variant="outline">{programCounts[u.id] || 0} programs</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {u.description && (
                    <p className="text-sm line-clamp-3 text-muted-foreground">{u.description}</p>
                  )}
                  <div className="flex gap-2">
                    {u.website && (
                      <a
                        href={u.website.startsWith("http") ? u.website : `https://${u.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" /> Website
                      </a>
                    )}
                    <Link
                      to={`/university/${u.id}`}
                      className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                    >
                      View details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
