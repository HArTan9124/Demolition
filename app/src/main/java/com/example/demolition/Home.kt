package com.example.demolition

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.demolition.databinding.FragmentHomeBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class Home : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val auth = FirebaseAuth.getInstance()
    private val realtimeDB = FirebaseDatabase.getInstance()
    private val firestore = FirebaseFirestore.getInstance()

    private val timetableList = ArrayList<TimetableItem>()
    private lateinit var timetableAdapter: TimetableAdapter

    override fun onCreateView(
        inflater: android.view.LayoutInflater, container: android.view.ViewGroup?,
        savedInstanceState: Bundle?,
    ): android.view.View {

        _binding = FragmentHomeBinding.inflate(inflater, container, false)

        setupRecyclerView()
        setupCardClicks()
        setupSyncButton()
        loadStudentClass()

        return binding.root
    }

    // ----------------- TIMETABLE RECYCLER -------------------

    private fun setupRecyclerView() {
        timetableAdapter = TimetableAdapter(timetableList)
        binding.rvTimetable.layoutManager = LinearLayoutManager(requireContext())
        binding.rvTimetable.adapter = timetableAdapter
    }

    // ----------------- COURSE CARDS -------------------------

    private fun setupCardClicks() {
        binding.cardMath.setOnClickListener {
            startActivity(Intent(requireContext(), Math::class.java))
        }

        binding.cardScience.setOnClickListener {
            startActivity(Intent(requireContext(), Science::class.java))
        }

        binding.cardGeo.setOnClickListener {
            startActivity(Intent(requireContext(), English::class.java))
        }

        binding.cardHistory.setOnClickListener {
            startActivity(Intent(requireContext(), sst::class.java))
        }
    }

    // ----------------- LOAD STUDENT CLASS -------------------------

    private fun loadStudentClass() {
        val uid = auth.currentUser?.uid ?: return

        val userRef = realtimeDB.getReference("Users/$uid")

        userRef.get()
            .addOnSuccessListener { snap ->
                if (!snap.exists()) {
                    showError("User data missing.")
                    return@addOnSuccessListener
                }

                val studentClass = snap.child("studentClass").value?.toString()
                val section = snap.child("section").value?.toString()

                if (studentClass.isNullOrEmpty() || section.isNullOrEmpty()) {
                    showError("Class or section missing.")
                    return@addOnSuccessListener
                }

                val className = "$studentClass-$section"
                loadTimeTableFromFirestore(className)
            }
            .addOnFailureListener {
                showError("Failed to load class.")
                Log.e("FIRESTORE", "Error loading student class", it)
            }
    }

    // ----------------- FIXED FIRESTORE TIMETABLE PATH -------------------------

    private fun loadTimeTableFromFirestore(className: String) {

        val orgId = "PlOfx4BQ3pgUAwpEP1AUSKcK8tq1"

        firestore.collection("class_timetables")
            .document(orgId)
            .collection("classes")
            .document(className)
            .get()
            .addOnSuccessListener { document ->

                if (!document.exists()) {
                    showError("No timetable found for $className.")
                    return@addOnSuccessListener
                }

                val rawSlots = document.get("slots")

                val slots = when (rawSlots) {
                    is List<*> -> rawSlots.filterIsInstance<Map<String, Any>>()  // NORMAL LIST
                    is Map<*, *> -> rawSlots.values.filterIsInstance<Map<String, Any>>() // MAP ✓
                    else -> null
                }

                if (slots.isNullOrEmpty()) {
                    showError("Empty timetable.")
                } else {
                    processTimetableData(slots)
                }

            }
            .addOnFailureListener { e ->
                showError("Failed to load timetable.")
                Log.e("FIRESTORE", "Timetable fetch error", e)
            }
    }


    // ----------------- FILTER TODAY CLASSES -------------------------

    private fun processTimetableData(slots: List<Map<String, Any>>) {
        timetableList.clear()

        val today = SimpleDateFormat("EEEE", Locale.getDefault()).format(Calendar.getInstance().time)
        var foundTodayClass = false

        for (item in slots) {
            val day = item["day"]?.toString() ?: ""
            if (!day.equals(today, ignoreCase = true)) continue

            val subject = item["subject"]?.toString() ?: "Unknown"
            val index = (item["slotIndex"] as? Number)?.toInt() ?: -1
            val time = convertSlotToTime(index)

            timetableList.add(TimetableItem(subject, time))
            foundTodayClass = true
        }

        if (!foundTodayClass) {
            showError("No classes today.")
        } else {
            timetableAdapter.notifyDataSetChanged()
        }
    }

    private fun convertSlotToTime(index: Int): String {
        return when (index) {
            0 -> "09:00 AM - 10:00 AM"
            1 -> "10:00 AM - 11:00 AM"
            2 -> "11:00 AM - 12:00 PM"
            3 -> "12:00 PM - 01:00 PM"
            4 -> "01:00 PM - 02:00 PM"
            5 -> "02:00 PM - 03:00 PM"
            else -> "Slot $index"
        }
    }

    private fun showError(msg: String) {
        timetableList.clear()
        timetableList.add(TimetableItem(msg, ""))
        timetableAdapter.notifyDataSetChanged()
    }

    // ----------------- CLOUD SYNC BUTTON -------------------------

    private fun setupSyncButton() {
        binding.SyncWithCloud.setOnClickListener {
            syncReportsToCloud()
        }
    }

    // ----------------- FINAL FIRESTORE SYNC -------------------------

    private fun syncReportsToCloud() {
        val context = requireContext()
        val reports = ReportManager.getReports(context)
        val unsynced = reports.filter { !it.synced }

        if (unsynced.isEmpty()) {
            Toast.makeText(context, "Everything is already synced!", Toast.LENGTH_SHORT).show()
            return
        }

        val db = FirebaseFirestore.getInstance()
        val uid = FirebaseAuth.getInstance().currentUser?.uid ?: return

        var uploaded = 0
        val total = unsynced.size

        for (report in unsynced) {

            val data = hashMapOf(
                "name" to report.name,
                "class" to report.studentClass,
                "subject" to report.subject,
                "chapter" to report.chapter,
                "date" to report.date,
                "time" to report.time,
                "score" to report.score
            )

            db.collection("quiz_reports")
                .document(uid)
                .collection("reports")
                .add(data)
                .addOnSuccessListener {
                    report.synced = true
                    uploaded++

                    ReportManager.saveReports(context, reports)

                    if (uploaded == total) {
                        Toast.makeText(context, "All reports synced!", Toast.LENGTH_LONG).show()
                    }
                }
                .addOnFailureListener { e ->
                    Toast.makeText(context, "Sync failed: ${e.message}", Toast.LENGTH_LONG).show()
                    Log.e("FIRESTORE_SYNC", e.message.toString())
                }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
