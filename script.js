// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const calendarDays = document.getElementById('calendar-days');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const dayOptions = document.querySelector('.day-options');
const workoutButton = document.querySelector('.workout-btn');
const leaveButton = document.querySelector('.leave-btn');
const dayNotesTextarea = document.getElementById('dayNotes');
const progressForm = document.getElementById('progressForm');
const goalForm = document.getElementById('goalForm');
const goalsList = document.getElementById('goalsList');

// State
let currentDate = new Date();
let selectedDate = null;
let gymData = JSON.parse(localStorage.getItem('gymData')) || {
    workouts: {},
    leaves: {},
    notes: {},
    progress: [],
    goals: []
};

// Navigation
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = button.dataset.section;
        
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(targetSection).classList.add('active');
    });
});

// Calendar Functions
function generateCalendar(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();

    currentMonthElement.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    calendarDays.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        calendarDays.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= monthLength; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        if (gymData.workouts[dateStr]) {
            dayElement.classList.add('workout');
        } else if (gymData.leaves[dateStr]) {
            dayElement.classList.add('leave');
        }

        dayElement.addEventListener('click', () => selectDay(dateStr, dayElement));
        calendarDays.appendChild(dayElement);
    }
}

function selectDay(dateStr, element) {
    selectedDate = dateStr;
    dayOptions.style.display = 'block';
    dayNotesTextarea.value = gymData.notes[dateStr] || '';
}

// BMI Category Images
const bmiImages = {
    underweight: 'https://img.freepik.com/free-vector/thin-man-looking-mirror-anorexia-male-character-trying-gain-weight-flat-vector-illustration_74855-20521.jpg',
    normal: 'https://img.freepik.com/free-vector/strong-man-with-good-immune-system-against-viruses_23-2148581837.jpg',
    overweight: 'https://img.freepik.com/free-vector/fat-man-doing-exercises-gym-overweight-person-training-getting-fit-losing-weight-flat-illustration_74855-20483.jpg',
    obese: 'https://img.freepik.com/free-vector/fat-man-measuring-waist-overweight-guy-checking-belly-size-with-tape-flat-illustration_74855-20520.jpg'
};

// Progress Tracking Functions
function calculateBMI(weight, heightInCm) {
    if (heightInCm <= 0 || weight <= 0) return 0;
    const heightInMeters = heightInCm / 100; // Convert cm to meters
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(1));
}

function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return {
            category: 'Underweight',
            color: '#3498db',
            image: bmiImages.underweight
        };
    } else if (bmi >= 18.5 && bmi < 25) {
        return {
            category: 'Normal',
            color: '#2ecc71',
            image: bmiImages.normal
        };
    } else if (bmi >= 25 && bmi < 30) {
        return {
            category: 'Overweight',
            color: '#f1c40f',
            image: bmiImages.overweight
        };
    } else {
        return {
            category: 'Obese',
            color: '#e74c3c',
            image: bmiImages.obese
        };
    }
}

function updateProgressChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    
    // Get progress data from localStorage
    const progressData = JSON.parse(localStorage.getItem('progressData') || '[]');
    
    // Format data for the chart
    const chartData = {
        labels: progressData.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [{
            label: 'Weight (kg)',
            data: progressData.map(entry => entry.weight),
            borderColor: '#ff4444',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ff4444',
            pointBorderColor: '#ffffff',
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    // Destroy existing chart if it exists
    if (window.weightChart) {
        window.weightChart.destroy();
    }

    // Create new chart
    window.weightChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + ' kg';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Weight: ${context.raw} kg`;
                        }
                    }
                }
            }
        }
    });
}

// Event Listeners
prevMonthButton.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

workoutButton.addEventListener('click', () => {
    if (selectedDate) {
        gymData.workouts[selectedDate] = true;
        delete gymData.leaves[selectedDate];
        localStorage.setItem('gymData', JSON.stringify(gymData));
        generateCalendar(currentDate);
    }
});

leaveButton.addEventListener('click', () => {
    if (selectedDate) {
        gymData.leaves[selectedDate] = true;
        delete gymData.workouts[selectedDate];
        localStorage.setItem('gymData', JSON.stringify(gymData));
        generateCalendar(currentDate);
    }
});

dayNotesTextarea.addEventListener('change', () => {
    if (selectedDate) {
        gymData.notes[selectedDate] = dayNotesTextarea.value;
        localStorage.setItem('gymData', JSON.stringify(gymData));
    }
});

progressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('weight').value);
    const heightInCm = parseFloat(document.getElementById('height').value);
    
    if (isNaN(weight) || isNaN(heightInCm) || weight <= 0 || heightInCm <= 0) {
        alert('Please enter valid height and weight values');
        return;
    }

    const bmi = calculateBMI(weight, heightInCm);
    const bmiInfo = getBMICategory(bmi);
    const recommendations = getBMIRecommendations(bmiInfo.category);

    // Update BMI display
    const bmiResult = document.getElementById('bmiResult');
    const bmiImage = document.getElementById('bmiImage');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const recommendationsDiv = document.getElementById('recommendations');

    bmiImage.src = bmiInfo.image;
    bmiImage.alt = `${bmiInfo.category} BMI Category`;
    
    bmiValue.textContent = `Height: ${heightInCm} cm | Weight: ${weight} kg | BMI: ${bmi.toFixed(1)}`;
    bmiCategory.textContent = bmiInfo.category;
    bmiCategory.style.backgroundColor = bmiInfo.color;
    
    recommendationsDiv.innerHTML = `
        <h3>Recommendations:</h3>
        <ul>
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;

    bmiResult.style.display = 'block';
    
    // Add to progress data
    const progressData = JSON.parse(localStorage.getItem('progressData') || '[]');
    progressData.push({
        date: new Date().toISOString(),
        weight: weight,
        height: heightInCm,
        bmi: bmi
    });
    localStorage.setItem('progressData', JSON.stringify(progressData));
    
    // Update the chart
    updateProgressChart();
    
    // Reset form
    progressForm.reset();
});

function getBMIRecommendations(category) {
    const recommendations = {
        Underweight: [
            'Consult with a healthcare provider about your weight',
            'Increase caloric intake with nutrient-rich foods',
            'Include protein-rich foods in every meal',
            'Consider strength training to build muscle mass',
            'Track your progress regularly'
        ],
        Normal: [
            'Maintain your current healthy lifestyle',
            'Regular exercise (150 minutes per week)',
            'Balanced diet with plenty of fruits and vegetables',
            'Stay hydrated',
            'Regular health check-ups'
        ],
        Overweight: [
            'Create a moderate calorie deficit',
            'Increase physical activity gradually',
            'Focus on portion control',
            'Choose whole foods over processed foods',
            'Consider working with a fitness professional'
        ],
        Obese: [
            'Consult with healthcare providers for a personalized plan',
            'Start with low-impact exercises',
            'Make sustainable dietary changes',
            'Set realistic weight loss goals',
            'Consider joining a support group'
        ]
    };

    return recommendations[category];
}

goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const goal = {
        targetWeight: parseFloat(document.getElementById('targetWeight').value) || null,
        targetBMI: parseFloat(document.getElementById('targetBMI').value) || null,
        targetDate: document.getElementById('targetDate').value,
        notes: document.getElementById('goalNotes').value
    };

    gymData.goals.push(goal);
    localStorage.setItem('gymData', JSON.stringify(gymData));
    updateGoalsList();
    goalForm.reset();
});

function updateGoalsList() {
    goalsList.innerHTML = '';
    gymData.goals.forEach((goal, index) => {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.innerHTML = `
            <div class="p-4 bg-[#2a2a2a] rounded-lg mb-3">
                <p><strong>Target Date:</strong> ${new Date(goal.targetDate).toLocaleDateString()}</p>
                ${goal.targetWeight ? `<p><strong>Target Weight:</strong> ${goal.targetWeight} kg</p>` : ''}
                ${goal.targetBMI ? `<p><strong>Target BMI:</strong> ${goal.targetBMI}</p>` : ''}
                <p><strong>Notes:</strong> ${goal.notes}</p>
                <button onclick="deleteGoal(${index})" class="text-red-400 mt-2">Delete</button>
            </div>
        `;
        goalsList.appendChild(goalElement);
    });
}

function deleteGoal(index) {
    gymData.goals.splice(index, 1);
    localStorage.setItem('gymData', JSON.stringify(gymData));
    updateGoalsList();
}

// Initialize
generateCalendar(currentDate);
updateProgressChart();
updateGoalsList(); 