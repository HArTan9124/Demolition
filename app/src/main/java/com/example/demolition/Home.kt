package com.example.demolition

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.demolition.databinding.FragmentHomeBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import kotlin.jvm.java


class Home : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val auth = FirebaseAuth.getInstance()
    private val realtimeDB = FirebaseDatabase.getInstance()
    private val firestore = FirebaseFirestore.getInstance()

    private val timetableList = ArrayList<TimetableItem>()
    private lateinit var timetableAdapter: TimetableAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)

        setupRecyclerView()
        setupCardClicks()
        loadStudentClass()

        return binding.root
    }

    private fun setupRecyclerView() {
        timetableAdapter = TimetableAdapter(timetableList)
        binding.rvTimetable.layoutManager = LinearLayoutManager(requireContext())
        binding.rvTimetable.adapter = timetableAdapter
    }

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


    /**
     * STEP 1 → Load student class + section from Realtime DB
     * Correct Path: Users/UID/studentClass and Users/UID/section
     */
    private fun loadStudentClass() {
        val uid = auth.currentUser?.uid ?: return

        val userRef = realtimeDB.getReference("Users/$uid")

        userRef.get().addOnSuccessListener { snap ->
            if (!snap.exists()) {
                showError("User data missing in Realtime DB.")
                return@addOnSuccessListener
            }

            val studentClass = snap.child("studentClass").value?.toString()
            val section = snap.child("section").value?.toString()

            if (studentClass.isNullOrEmpty() || section.isNullOrEmpty()) {
                showError("Class or section not found.")
                return@addOnSuccessListener
            }

            // Construct final class name → Example: "1-A"
            val className = "${studentClass}-${section}"

            loadTimeTableFromFirestore(className)
        }
            .addOnFailureListener {
                showError("Failed to load class information.")
            }
    }

    /**
     * STEP 2 → Load timetable from Firestore for class: "1-A"
     */
    private fun loadTimeTableFromFirestore(className: String) {

        val orgId = "zQL49YoMJRfglot67ZYh9dDMpcF2"

        firestore.collection("class_timetables")
            .document(orgId)
            .collection("classes")
            .document(className)
            .get()
            .addOnSuccessListener { document ->

                if (!document.exists()) {
                    showError("Timetable not found for class $className.")
                    return@addOnSuccessListener
                }

                val slots = document.get("slots") as? List<Map<String, Any>>

                if (slots.isNullOrEmpty()) {
                    showError("No timetable available.")
                } else {
                    processTimetableData(slots)
                }
            }
            .addOnFailureListener {
                showError("Unable to fetch timetable.")
            }
    }

    /**
     * STEP 3 → Filter by day + show schedule
     */
    private fun processTimetableData(slots: List<Map<String, Any>>) {
        timetableList.clear()

        val currentDay = SimpleDateFormat("EEEE", Locale.getDefault()).format(Calendar.getInstance().time)

        var found = false

        for (item in slots) {
            val day = item["day"]?.toString() ?: ""
            if (!day.equals(currentDay, ignoreCase = true)) continue

            val subject = item["subject"]?.toString() ?: "Unknown"
            val index = (item["slotIndex"] as? Number)?.toInt() ?: -1
            val time = convertSlotToTime(index)

            timetableList.add(TimetableItem(subject, time))
            found = true
        }

        if (!found) {
            showError("No classes for $currentDay.")
        } else timetableAdapter.notifyDataSetChanged()
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
