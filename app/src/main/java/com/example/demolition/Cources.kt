package com.example.demolition

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import com.example.demolition.databinding.FragmentCourcesBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class Cources : Fragment() {

    private var _binding: FragmentCourcesBinding? = null
    private val binding get() = _binding!!
    
    private val auth = FirebaseAuth.getInstance()
    private val realtimeDB = FirebaseDatabase.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    
    // Store timetable for entire week
    private val weeklyTimetable = mutableMapOf<String, MutableList<TimetableItem>>()
    private val daysOfWeek = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
    
    private var selectedDay = "Monday"
    private lateinit var dayButtons: List<Button>

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentCourcesBinding.inflate(inflater, container, false)

        setupDayButtons()
        setupClicks()
        loadStudentClass()

        return binding.root
    }
    
    // ----------------- DAY SELECTOR BUTTONS -------------------------
    
    private fun setupDayButtons() {
        dayButtons = listOf(
            binding.btnMonday,
            binding.btnTuesday,
            binding.btnWednesday,
            binding.btnThursday,
            binding.btnFriday
        )
        
        // Set current day as default
        val today = SimpleDateFormat("EEEE", Locale.getDefault()).format(Calendar.getInstance().time)
        selectedDay = if (today in daysOfWeek) today else "Monday"
        
        // Setup click listeners
        binding.btnMonday.setOnClickListener { selectDay("Monday") }
        binding.btnTuesday.setOnClickListener { selectDay("Tuesday") }
        binding.btnWednesday.setOnClickListener { selectDay("Wednesday") }
        binding.btnThursday.setOnClickListener { selectDay("Thursday") }
        binding.btnFriday.setOnClickListener { selectDay("Friday") }
        
        // Highlight initial day
        updateButtonStates()
    }
    
    private fun selectDay(day: String) {
        selectedDay = day
        updateButtonStates()
        displaySelectedDay()
    }
    
    private fun updateButtonStates() {
        val dayButtonMap = mapOf(
            "Monday" to binding.btnMonday,
            "Tuesday" to binding.btnTuesday,
            "Wednesday" to binding.btnWednesday,
            "Thursday" to binding.btnThursday,
            "Friday" to binding.btnFriday
        )
        
        dayButtonMap.forEach { (day, button) ->
            if (day == selectedDay) {
                // Selected state - purple background, white text
                button.setBackgroundResource(R.drawable.rounded_blue_card)
                button.setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
            } else {
                // Unselected state - white background, gray text
                button.setBackgroundResource(R.drawable.card_white)
                button.setTextColor(ContextCompat.getColor(requireContext(), android.R.color.darker_gray))
            }
        }
    }
    
    // ----------------- LOAD STUDENT CLASS -------------------------
    
    private fun loadStudentClass() {
        val uid = auth.currentUser?.uid ?: run {
            showError("Please login to view timetable")
            return
        }

        val userRef = realtimeDB.getReference("Users/$uid")

        userRef.get()
            .addOnSuccessListener { snap ->
                if (!snap.exists()) {
                    showError("User data missing")
                    return@addOnSuccessListener
                }

                val studentClass = snap.child("studentClass").value?.toString()
                val section = snap.child("section").value?.toString()

                if (studentClass.isNullOrEmpty() || section.isNullOrEmpty()) {
                    showError("Class or section missing")
                    return@addOnSuccessListener
                }

                val className = "$studentClass-$section"
                loadTimeTableFromFirestore(className)
            }
            .addOnFailureListener {
                showError("Failed to load class data")
                Log.e("Cources", "Error loading student class", it)
            }
    }

    // ----------------- LOAD TIMETABLE FROM FIRESTORE -------------------------
    
    private fun loadTimeTableFromFirestore(className: String) {
        val orgId = "PlOfx4BQ3pgUAwpEP1AUSKcK8tq1"

        firestore.collection("class_timetables")
            .document(orgId)
            .collection("classes")
            .document(className)
            .get()
            .addOnSuccessListener { document ->

                if (!document.exists()) {
                    showError("No timetable found for $className")
                    return@addOnSuccessListener
                }

                val rawSlots = document.get("slots")

                val slots = when (rawSlots) {
                    is List<*> -> rawSlots.filterIsInstance<Map<String, Any>>()
                    is Map<*, *> -> rawSlots.values.filterIsInstance<Map<String, Any>>()
                    else -> null
                }

                if (slots.isNullOrEmpty()) {
                    showError("Empty timetable")
                } else {
                    processTimetableData(slots)
                }

            }
            .addOnFailureListener { e ->
                showError("Failed to load timetable")
                Log.e("Cources", "Timetable fetch error", e)
            }
    }

    // ----------------- PROCESS FULL WEEK'S TIMETABLE -------------------------
    
    private fun processTimetableData(slots: List<Map<String, Any>>) {
        weeklyTimetable.clear()
        
        // Initialize all days
        daysOfWeek.forEach { day ->
            weeklyTimetable[day] = mutableListOf()
        }

        // Group classes by day
        for (item in slots) {
            val day = item["day"]?.toString() ?: continue
            val subject = item["subject"]?.toString() ?: "Unknown"
            val index = (item["slotIndex"] as? Number)?.toInt() ?: -1
            val time = convertSlotToTime(index)

            weeklyTimetable[day]?.add(TimetableItem(subject, time))
        }
        
        // Sort each day's classes by time (slot index)
        weeklyTimetable.forEach { (_, classes) ->
            classes.sortBy { it.time }
        }

        displaySelectedDay()
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
    
    private fun displaySelectedDay() {
        val classes = weeklyTimetable[selectedDay] ?: emptyList()
        
        binding.timetableDay.text = "$selectedDay's Schedule"
        binding.timetableContainer.visibility = View.VISIBLE
        
        if (classes.isEmpty()) {
            binding.timetableSchedule.text = "📅 No classes scheduled for $selectedDay\n\n🎉 Enjoy your free day!"
        } else {
            val scheduleText = buildString {
                classes.forEachIndexed { index, entry ->
                    append("━━━━━━━━━━━━━━━━━━━━━\n")
                    append("📚 Period ${index + 1}\n")
                    append("━━━━━━━━━━━━━━━━━━━━━\n\n")
                    append("🕐 ${entry.time}\n")
                    append("📖 ${entry.subject}\n\n")
                }
            }
            binding.timetableSchedule.text = scheduleText.trim()
        }
    }

    private fun showError(msg: String) {
        binding.timetableDay.text = msg
        binding.timetableContainer.visibility = View.VISIBLE
        binding.timetableSchedule.text = "Unable to load timetable"
    }

    private fun setupClicks() {

        // 📘 Math
        binding.mathCard.setOnClickListener {
            val intent = Intent(requireContext(), Math::class.java)
            startActivity(intent)
        }

        // 🔬 Science
        binding.scienceCard.setOnClickListener {
            val intent = Intent(requireContext(), Science::class.java)
            startActivity(intent)
        }

        // 📚 English
        binding.englishCard.setOnClickListener {
            val intent = Intent(requireContext(), English::class.java)
            startActivity(intent)
        }

        // 🌍 SST
        binding.sstCard.setOnClickListener {
            val intent = Intent(requireContext(), sst::class.java)
            startActivity(intent)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
