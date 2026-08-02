import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { ArrowLeft, Phone, CalendarCheck } from "lucide-react";

import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);

  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // The member's profile — created once, never duplicated week to week.
  useEffect(() => {
    const loadMember = async () => {
      try {
        const memberSnap = await getDoc(doc(db, "members", id));
        if (memberSnap.exists()) {
          setMember({ id: memberSnap.id, ...memberSnap.data() });
        }
      } catch (error) {
        console.error("Error loading member:", error);
      } finally {
        setLoadingMember(false);
      }
    };

    loadMember();
  }, [id]);

  // Every Sunday this person has been marked present.
  useEffect(() => {
    const attendanceRef = collection(db, "attendance");
    const attendanceQuery = query(
      attendanceRef,
      where("memberId", "==", id),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setAttendance(data);
        setLoadingAttendance(false);
      },
      (error) => {
        console.error("Error loading attendance history:", error);
        setLoadingAttendance(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Profile */}
      <div className="border border-gray-100 rounded-xl p-6">

        {loadingMember ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : !member ? (
          <p className="text-sm text-gray-400">Member not found.</p>
        ) : (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 break-words">
                {member.fullName || "Unnamed Member"}
              </h1>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-500">
                {member.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} />
                    {member.phone}
                  </span>
                )}
                {member.department && <span>· {member.department}</span>}
              </div>
            </div>

            {role === "admin" && member.createdByName && (
              <span className="text-xs text-gray-400 shrink-0">
                Registered by {member.createdByName}
              </span>
            )}
          </div>
        )}

      </div>

      {/* Attendance history */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">

        <div className="flex items-center justify-between px-6 pt-6 mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Attendance History
          </h2>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarCheck size={14} />
            {loadingAttendance ? "—" : `${attendance.length} Sunday${attendance.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {loadingAttendance ? (
          <p className="text-sm text-gray-400 px-6 pb-6">Loading...</p>
        ) : attendance.length === 0 ? (
          <p className="text-sm text-gray-400 px-6 pb-6">
            No attendance recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {record.date}
                </span>
                <span className="text-xs text-gray-400">
                  Marked by {record.createdByName || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}