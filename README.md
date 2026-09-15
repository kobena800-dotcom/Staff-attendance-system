Staff Attendance System

A modern, professional web-based Staff Attendance Management System designed to help businesses manage employee attendance efficiently using QR code scanning, staff accounts, check-in/check-out records, and attendance reports.

📌 Overview

The Staff Attendance System provides an easy way for organizations to record and monitor daily employee attendance.

Instead of relying on paper attendance books, staff can use the system to record their arrival and departure times. Administrators can manage staff, generate individual QR codes, view attendance reports, and monitor attendance history.

✨ Main Features

🔐 Login System

- Admin login
- Staff login
- Secure access to attendance features
- Admin username and password management

📱 QR Code Attendance

- Individual QR codes for registered staff
- QR code check-in
- QR code check-out
- Camera-based QR scanning
- Manual attendance option when QR scanning is unavailable

👥 Staff Management

Administrators can:

- Register new staff
- Create staff IDs
- Add departments
- Add staff email addresses
- Set expected check-in times
- Generate staff QR codes
- View registered staff
- Manage staff records

⏰ Attendance Tracking

The system records:

- Staff name
- Staff ID
- Check-in date
- Check-in time
- Check-out time
- Attendance status
- Late arrivals
- Checked-out staff

📊 Daily Attendance Reports

The dashboard provides attendance statistics such as:

- Total Present
- Late Arrivals
- Absent
- Checked Out

Administrators can refresh the report and export attendance information as a CSV file.

📅 Attendance History

Administrators can review previous attendance records using date-based history and monitor staff attendance over time.

⚙️ Admin Panel

The Admin Panel provides tools for:

- Staff management
- QR code generation
- Attendance statistics
- Database/record management
- Backup and restore functions
- Account settings

🛠️ Technologies Used

The current system is built with:

- HTML5 — website structure
- CSS3 — interface and responsive design
- JavaScript — application functionality
- jsQR — QR code scanning
- QRCode.js — QR code generation
- GitHub Pages — website hosting

📂 Project Structure

staff-attendance-system/
│
├── index.html
└── README.md

The main application is currently contained in "index.html".

🚀 How to Use

1. Open the System

Open the deployed Staff Attendance System website using a web browser.

2. Administrator

The administrator can:

1. Log into the Admin Panel.
2. Register staff members.
3. Create staff IDs.
4. Generate individual QR codes.
5. Give each staff member their QR code.
6. Monitor daily attendance.
7. Review attendance history.
8. Export attendance reports.

3. Staff

Staff members can log into the system and use their assigned account to access the attendance functions.

For attendance, the staff member can scan their personal QR code or use the available manual option.

4. Check-In

When a staff member arrives:

1. Open the attendance system.
2. Select QR Check-In.
3. Start the camera.
4. Scan the staff member's QR code.
5. The system records the date and arrival time.
6. The system determines whether the staff member is on time or late.

5. Check-Out

At the end of the working day:

1. Open QR Check-Out.
2. Start the camera.
3. Scan the staff member's QR code.
4. The system records the check-out time.

⏱️ Attendance Rules

The system is configured around a standard working start time of 9:00 AM.

Staff arriving after the configured late threshold are identified as late arrivals.

These settings can be modified as the system develops.

📈 Future Development

Planned improvements include:

- ☁️ Cloud database integration
- 🔒 Improved authentication and security
- 👤 Individual staff profiles
- 📊 Advanced attendance analytics
- 📧 Email notifications
- 📱 Improved mobile experience
- 🏢 Multiple company/branch support
- 🗓️ Monthly and yearly reports
- 📥 PDF attendance reports
- 💾 Automatic cloud backup
- 🔑 Password reset functionality
- 👨‍💼 Multiple administrator accounts
- 🌐 Custom domain support
- 🔄 Real-time synchronization across devices

☁️ Database Integration

A future version of the system can use Supabase for cloud-based data storage and authentication.

This will allow attendance records and staff information to be stored securely online instead of relying only on the browser's local storage.

🔒 Security

Security is an important part of the future development of this project.

Planned security improvements include:

- Secure user authentication
- Protected administrator functions
- Database access controls
- Password security
- User permissions
- Secure cloud data storage
- Backup and recovery

«Important: The current GitHub Pages version should be considered a prototype until full authentication and cloud database security are implemented.»

📱 Responsive Design

The system is designed to work on:

- 📱 Smartphones
- 💻 Desktop computers
- 🖥️ Laptops
- 📟 Tablets

The goal is to make attendance management simple and accessible from different devices.

🎯 Project Goal

The goal of the Staff Attendance System is to provide businesses with a simple and affordable digital solution for managing employee attendance.

It is designed to reduce paperwork, improve attendance accuracy, make reporting easier, and give administrators better visibility into staff attendance.

👨‍💻 Project Status

Current Status: 🚧 Active Development

The system is currently being developed and improved with additional features, security, database integration, and a more professional user experience.

📄 License

This project is currently intended for development and educational purposes.

A formal open-source license may be added in a future version.

---

Built with ❤️ for modern staff attendance management.
