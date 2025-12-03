package com.example.demolition

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.demolition.databinding.FragmentCourcesBinding

class Cources : Fragment() {

    private var _binding: FragmentCourcesBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentCourcesBinding.inflate(inflater, container, false)

        setupClicks()

        return binding.root
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
