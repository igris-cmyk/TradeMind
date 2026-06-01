"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { useStrategies, useCreateStrategy, useDeleteStrategy } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { fadeUp, spring, stagger } from "@/lib/motion";

const CONCEPT_TYPES = ["ICT", "SMC", "Wyckoff", "Price Action", "Custom"];

export default function StrategiesPage() {
  const { data, isLoading } = useStrategies();
  const createStrategy = useCreateStrategy();
  const deleteStrategy = useDeleteStrategy();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conceptType, setConceptType] = useState("ICT");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createStrategy.mutateAsync({ name, description, conceptType });
    setName("");
    setDescription("");
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="text" className="h-7 w-32" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" count={6} className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-5"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Strategies</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Manage your setups, playbook models, and concepts
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3.5 w-3.5" />
          New Strategy
        </Button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={spring.gentle}
          >
            <Card className="glass-card mb-4">
              <CardContent className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Strategy Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Breaker Block + FVG"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Concept Type</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {CONCEPT_TYPES.map((ct) => (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => setConceptType(ct)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all duration-150",
                            conceptType === ct
                              ? "border-primary/20 bg-primary/10 text-primary-300"
                              : "border-transparent text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                          )}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe trade entry filters, invalidation parameters, and execution rules..."
                    className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary min-h-[72px] resize-y"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button size="sm" className="text-xs" onClick={handleCreate} loading={createStrategy.isPending} disabled={!name.trim()}>
                    Create Strategy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategies List */}
      {!data?.strategies?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No strategies setup yet"
          description="Build out your catalog of setups to categorize and analytics-track your exact playbooks."
          actionLabel="Create First Strategy"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {data.strategies.map((strategy: Record<string, unknown>) => (
              <motion.div
                key={strategy.id as string}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={spring.gentle}
              >
                <Card className="glass-card hover:border-white/[0.12] transition-all group">
                  <CardHeader className="pb-2 flex-row justify-between items-start space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold">{strategy.name as string}</CardTitle>
                      {Boolean(strategy.conceptType) && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase bg-primary/10 text-primary-300">
                          {strategy.conceptType as string}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent-red"
                      onClick={() => deleteStrategy.mutate(strategy.id as string)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground/80 min-h-[32px] line-clamp-2">
                      {(strategy.description as string) || "No description provided."}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
