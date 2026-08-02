import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Search, CheckCircle2, UserCheck, Phone } from "lucide-react";
import { toast } from "react-hot-toast";

import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// "2026-08-02" — matches the date format already used elsewhere in the app
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Attendance() {
  const { user, role } = useAuth();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [todaysAttendance, setTodaysAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const [search, setSearch] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const today = todayKey();

  // The member roster — one profile per person, created once. Admin sees
  // every member; a leader/user sees only the ones they registered.
  useEffect(() => {
    if (!user) return;

    const base = collection(db, "members");
    const membersQuery =
      role === "admin"
        ? query(base, orderBy("fullName", "asc"))
        : query(base, where("createdBy", "==", user.uid), orderBy("fullName", "asc"));

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMembers(data);
        setLoadingMembers(false);
      },
      (error) => {
        console.error("Error loading members:", error);
        setLoadingMembers(false);
      }
    );

    return () => unsubscribe();
  }, [user, role]);

  // Who has already been marked present today, scoped the same way as the
  // roster above, so we can block duplicates and show status inline.
  useEffect(() => {
    if (!user) return;

    const base = collection(db, "attendance");
    const attendanceQuery =
      role === "admin"
        ? query(base, where("date", "==", today))
        : query(base, where("createdBy", "==", user.uid), where("date", "==", today));

    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setTodaysAttendance(data);
        setLoadingAttendance(false);
      },
      (error) => {
        console.error("Error loading today's attendance:", error);
        setLoadingAttendance(false);
      }
    );

    return () => unsubscribe();
  }, [user, role, today]);

  const presentMemberIds = useMemo(
    () => new Set(todaysAttendance.map((a) => a.memberId)),
    [todaysAttendance]
  );

  const filteredMembers = members.filter((member) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return `${member.fullName} ${member.phone} ${member.department || ""}`
      .toLowerCase()
      .includes(term);
  });

  const presentCount = presentMemberIds.size;
  const loading = loadingMembers || loadingAttendance;

  const markPresent = async (member) => {
    // Belt-and-suspenders: block duplicates locally before hitting Firestore,
    // in case two clicks land before the snapshot updates.
    if (presentMemberIds.has(member.id)) {
      toast.error(`${member.fullName || "This member"} is already marked present today.`);
      return;
    }

    setMarkingId(member.id);

    // Deterministic doc ID ("memberId_date") lets Firestore rules reject a
    // duplicate write server-side via !exists(), instead of relying only
    // on the client-side check above.
    const attendanceId = `${member.id}_${today}`;

    try {
      await setDoc(doc(db, "attendance", attendanceId), {
        memberId: member.id,
        memberName: member.fullName || "Unnamed Member",
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        date: today,
        createdAt: serverTimestamp(),
      });
      toast.success(`${member.fullName || "Member"} marked present.`);
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error(
        error.code === "permission-denied"
          ? `${member.fullName || "This member"} is already marked present today.`
          : "Failed to mark attendance. Please try again."
      );
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
          Attendance
        </h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">
          Mark today's register — {today}.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            type="text"
            placeholder="Search by name, phone, or department..."
            className="pl-9 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <p className="text-sm text-slate-500">
          {loading ? "Loading…" : `${presentCount} of ${members.length} marked present today`}
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl">
        <CardContent className="p-4 md:p-6">

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : filteredMembers.length === 0 ? (
            <p className="text-sm text-slate-500">
              {members.length === 0
                ? "No members registered yet."
                : "No members match your search."}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const isPresent = presentMemberIds.has(member.id);
                const isMarking = markingId === member.id;

                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 break-words">
                        {member.fullName || "Unnamed Member"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 text-sm text-slate-500">
                        {member.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={13} />
                            {member.phone}
                          </span>
                        )}
                        {member.department && <span>· {member.department}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => markPresent(member)}
                      disabled={isPresent || isMarking}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 disabled:cursor-not-allowed ${
                        isPresent
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                      }`}
                    >
                      {isPresent ? (
                        <>
                          <CheckCircle2 size={16} />
                          Present
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          {isMarking ? "Marking..." : "Mark Present"}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}