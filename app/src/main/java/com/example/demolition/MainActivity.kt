package com.example.demolition

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.navigation.NavigationView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class MainActivity : AppCompatActivity() {

    private lateinit var tvUserName: TextView
    private lateinit var ivUserProfile: ImageView
    private lateinit var auth: FirebaseAuth
    private lateinit var realtimeDB: FirebaseDatabase
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navView: NavigationView
    private lateinit var bottomNav: BottomNavigationView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        drawerLayout = findViewById(R.id.drawer_layout)
        navView = findViewById(R.id.nav_view)
        bottomNav = findViewById(R.id.bottom_nav)

        // Fix system insets for status bar/notch
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main_root)) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        auth = FirebaseAuth.getInstance()
        realtimeDB = FirebaseDatabase.getInstance()

        tvUserName = findViewById(R.id.tv_username)
        ivUserProfile = findViewById(R.id.ivToolbarPic)

        setupDrawerMenu()
        setupBottomNavigation()
        loadUserProfile()
        setupBackPressHandler()

        // Show Home on startup
        loadFragment(Home())
    }
    
    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
                    drawerLayout.closeDrawer(GravityCompat.START)
                } else {
                    // Let system handle back (exit app)
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupDrawerMenu() {
        val toggle = ActionBarDrawerToggle(
            this,
            drawerLayout,
            R.string.app_name,
            R.string.app_name
        )
        drawerLayout.addDrawerListener(toggle)
        toggle.syncState()

        navView.setNavigationItemSelectedListener { item ->
            drawerLayout.closeDrawer(GravityCompat.START)

            val id = item.itemId

            if (id == R.id.nav_home) loadFragment(Home())
            else if (id == R.id.nav_courses) loadFragment(Cources())
//            else if (id == R.id.nav_progress) loadFragment(Progress())
            else if (id == R.id.nav_profile) loadFragment(Profile())

            true
        }
    }

    /**
     * BOTTOM NAVIGATION
     */
    private fun setupBottomNavigation() {
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> loadFragment(Home())
                R.id.nav_courses -> loadFragment(Cources())
//                R.id.nav_progress -> loadFragment(Progress())
                R.id.nav_profile -> loadFragment(Profile())
            }
            true
        }
    }

    /**
     * FRAGMENT LOADER
     */
    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, fragment)
            .commit()
    }

    /**
     * LOAD USER PROFILE FROM REALTIME DATABASE
     */
    private fun loadUserProfile() {
        val userId = auth.currentUser?.uid ?: return

        realtimeDB.getReference("Users/$userId")
            .addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    if (snapshot.exists()) {
                        val user = snapshot.getValue(User::class.java)
                        
                        user?.let {
                            // Display user's full name
                            tvUserName.text = it.name.ifEmpty { 
                                "${it.firstName} ${it.lastName}".trim()
                            }

                            // Display selected avatar
                            if (it.avatarId.isNotEmpty()) {
                                val avatarRes = resources.getIdentifier(
                                    it.avatarId,
                                    "drawable",
                                    packageName
                                )
                                if (avatarRes != 0) {
                                    ivUserProfile.setImageResource(avatarRes)
                                }
                            }
                        }
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    // Handle error silently or show a toast
                }
            })
    }
}
