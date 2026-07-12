import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParticipationQueue, getMyParticipations } from "@/lib/actions/gamification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipationTable } from "@/components/gamification/ParticipationTable";
import { Medal, ClipboardList } from "lucide-react";

export const metadata = {
  title: "Challenge Participation — EcoSphere",
};

export default async function ParticipationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  const [myParticipations, queue] = await Promise.all([
    getMyParticipations(),
    isAdmin ? getParticipationQueue() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Challenge Participation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your challenge submissions and review pending approvals.
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? "queue" : "mine"} className="space-y-4">
        <TabsList>
          {isAdmin && (
            <TabsTrigger value="queue" className="gap-2">
              <ClipboardList className="size-4" />
              Approval Queue
              {queue.length > 0 && (
                <span className="ml-1 rounded-full bg-chart-3/20 text-chart-3 px-1.5 py-0.5 text-[10px] font-mono">
                  {queue.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="mine" className="gap-2">
            <Medal className="size-4" />
            My Submissions
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="queue">
            <ParticipationTable
              rows={queue.map((p) => ({
                id: p.id,
                employeeName: p.employee.name,
                employeeEmail: p.employee.user.email,
                department: p.employee.department.name,
                challengeTitle: p.challenge.title,
                xpAtStake: p.challenge.xp,
                proofUrl: p.proofUrl,
                evidenceRequired: p.challenge.evidenceRequired,
                approval: p.approval,
                createdAt: p.createdAt,
              }))}
              mode="admin"
            />
          </TabsContent>
        )}

        <TabsContent value="mine">
          <ParticipationTable
            rows={myParticipations.map((p) => ({
              id: p.id,
              challengeTitle: p.challenge.title,
              categoryName: p.challenge.category.name,
              xpAtStake: p.challenge.xp,
              xpAwarded: p.xpAwarded,
              proofUrl: p.proofUrl,
              approval: p.approval,
              progress: p.progress,
              deadline: p.challenge.deadline,
              createdAt: p.createdAt,
            }))}
            mode="employee"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
