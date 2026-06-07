import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AICoach = () => {
  const { user, api } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState('advice');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    goal: user?.fitnessGoal || 'maintenance',
    duration: 4,
    equipment: 'basic',
    experience: 'intermediate',
    calories: user?.dailyCalorieTarget || 2000,
    dietaryPreference: 'balanced',
    focusArea: 'full body'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    // Simulated AI responses since Gemini API key may not be configured
    setTimeout(() => {
      let aiResponse = '';
      
      switch (selectedFeature) {
        case 'workout':
          aiResponse = generateWorkoutPlan(formData);
          break;
        case 'meal':
          aiResponse = generateMealPlan(formData);
          break;
        case 'advice':
          aiResponse = generateFitnessAdvice(formData.question, user);
          break;
        case 'analyze':
          aiResponse = generateProgressAnalysis(user);
          break;
        default:
          aiResponse = "I'm here to help with your fitness journey! What would you like to know?";
      }
      
      setResponse(aiResponse);
      toast.success('AI response generated!');
      setLoading(false);
    }, 1500);
  };

  const generateWorkoutPlan = (data) => {
    return `# Personalized ${data.duration}-Week Workout Plan

## Goal: ${data.goal.replace('_', ' ').toUpperCase()}
## Experience Level: ${data.experience}
## Equipment: ${data.equipment}

### Weekly Schedule:
- **Monday**: Upper Body Strength
- **Tuesday**: Cardio + Core
- **Wednesday**: Lower Body Strength  
- **Thursday**: Active Recovery / Light Cardio
- **Friday**: Full Body Workout
- **Saturday**: HIIT or Sports
- **Sunday**: Rest Day

### Sample Upper Body Day:
1. **Push-ups** - 3 sets × 10-15 reps
2. **Dumbbell Rows** - 3 sets × 12 reps per arm
3. **Overhead Press** - 3 sets × 10 reps
4. **Bicep Curls** - 3 sets × 12 reps
5. **Tricep Dips** - 3 sets × 10 reps

### Cardio Recommendations:
- 20-30 minutes moderate intensity cardio
- Try: Running, cycling, swimming, or brisk walking
- Heart rate target: 120-150 BPM

### Progression Tips:
- Increase weight by 5-10% every 2 weeks
- Add 1-2 reps each week
- Focus on proper form over heavy weights

### Recovery:
- 7-9 hours of sleep nightly
- Stretch for 10 minutes after workouts
- Take rest days seriously for muscle growth

**Remember**: Consistency is more important than intensity! Start where you are and build up gradually.`;
  };

  const generateMealPlan = (data) => {
    return `# ${data.days || 7}-Day Meal Plan
## Daily Target: ${data.calories} calories
## Diet Type: ${data.dietaryPreference}

### Sample Day Menu:

**Breakfast (${Math.round(data.calories * 0.25)} cal)**
- Oatmeal with berries and nuts
- 2-3 scrambled eggs
- Green tea or black coffee

**Morning Snack (${Math.round(data.calories * 0.1)} cal)**
- Greek yogurt or apple with peanut butter
- Handful of almonds

**Lunch (${Math.round(data.calories * 0.3)} cal)**
- Grilled chicken breast or tofu
- Quinoa or brown rice
- Large mixed green salad
- Olive oil dressing

**Afternoon Snack (${Math.round(data.calories * 0.1)} cal)**
- Protein shake or banana
- Rice cakes with avocado

**Dinner (${Math.round(data.calories * 0.25)} cal)**
- Baked salmon or lentil curry
- Roasted vegetables (broccoli, sweet potato)
- Small portion of complex carbs

### Macro Breakdown (grams):
- **Protein**: ${Math.round(data.calories * 0.3 / 4)}g
- **Carbs**: ${Math.round(data.calories * 0.4 / 4)}g  
- **Fats**: ${Math.round(data.calories * 0.3 / 9)}g

### Hydration:
- Drink 2.5-3 liters of water daily
- Herbal teas count toward hydration
- Limit sugary drinks and alcohol

### Meal Prep Tips:
- Cook grains and proteins in bulk on Sundays
- Chop vegetables ahead of time
- Use portion control containers
- Keep healthy snacks visible and accessible

### Sample Grocery List:
- **Proteins**: Chicken, fish, eggs, tofu, beans
- **Carbs**: Oats, quinoa, brown rice, sweet potatoes
- **Veggies**: Spinach, broccoli, bell peppers, carrots
- **Fruits**: Berries, apples, bananas
- **Healthy Fats**: Avocado, nuts, olive oil
- **Dairy/Alternatives**: Greek yogurt, almond milk`;
  };

  const generateFitnessAdvice = (question, user) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('weight loss') || lowerQuestion.includes('lose weight')) {
      return `## Tips for Healthy Weight Loss

Based on your profile (age ${user?.age}, ${user?.gender}), here are personalized recommendations:

### Nutrition:
- Create a moderate calorie deficit of 300-500 calories/day
- Focus on protein-rich foods to preserve muscle
- Eat plenty of fiber-rich vegetables for satiety
- Track your intake for 2 weeks to understand portions

### Exercise:
- Combine strength training (3x/week) with cardio (2-3x/week)
- NEAT (Non-Exercise Activity) is crucial - walk 8-10k steps daily
- HIIT workouts can boost metabolism for hours

### Lifestyle:
- Sleep 7-8 hours - poor sleep increases hunger hormones
- Manage stress through meditation or yoga
- Drink water before meals to reduce intake

### Realistic Timeline:
- Healthy rate: 0.5-1 kg per week
- Don't expect linear progress - weight fluctuates
- Focus on how you feel, not just the scale

**Remember**: Sustainable weight loss is a marathon, not a sprint!`;
    }
    
    else if (lowerQuestion.includes('muscle') || lowerQuestion.includes('gain')) {
      return `## Muscle Building Guide for ${user?.gender === 'male' ? 'Men' : 'Women'}

### Nutrition Priorities:
- **Calorie surplus**: +250-500 calories above maintenance
- **Protein intake**: 1.6-2.2g per kg of body weight
- **Carbs**: Essential for energy and recovery
- **Fats**: Don't neglect healthy fats for hormones

### Training Principles:
- Progressive overload is KEY - add weight/reps weekly
- Focus on compound movements (squat, deadlift, bench press)
- Train each muscle group 2x per week
- 8-12 reps for hypertrophy, 4-6 for strength

### Sample Split:
- Day 1: Push (chest, shoulders, triceps)
- Day 2: Pull (back, biceps)
- Day 3: Legs + Core
- Day 4: Rest
- Day 5: Upper body
- Day 6: Lower body
- Day 7: Active recovery

### Recovery:
- Sleep 8+ hours for optimal growth hormone
- Take deload weeks every 6-8 weeks
- Proper warm-up and cool-down

**Beginner tip**: Focus on form before weight. Quality over quantity!`;
    }
    
    else if (lowerQuestion.includes('motivation') || lowerQuestion.includes('stay consistent')) {
      return `## Staying Motivated on Your Fitness Journey

### Mindset Shifts:
- **Don't rely on motivation** - build discipline and habits
- Focus on process goals, not just outcome goals
- Celebrate small wins (e.g., "I showed up 5 days this week")

### Practical Strategies:
1. **Schedule your workouts** like important meetings
2. **Prepare the night before** - lay out clothes, pack gym bag
3. **Find an accountability partner** or join a fitness community
4. **Track your progress** - seeing improvement fuels consistency
5. **Make it enjoyable** - find activities you genuinely like

### When You Don't Feel Like It:
- Use the "5-minute rule" - just start for 5 minutes
- Remember your "why" - write it down and read it daily
- Lower the barrier - home workouts on tough days
- Forgive yourself for missed days - don't let one become two

### Visual Reminders:
- Progress photos every 4 weeks
- Take measurements and track strength gains
- Celebrate non-scale victories (better sleep, more energy)

**Quote to remember**: "Motivation is what gets you started. Habit is what keeps you going."`;
    }
    
    else {
      return `## Personalized Fitness Advice

Hi there! Based on your profile, here are some general recommendations:

### Your Current Stats:
- **Age**: ${user?.age || 'Not specified'}
- **Goal**: ${user?.fitnessGoal?.replace('_', ' ') || 'Maintenance'}
- **BMI**: ${user?.bmi || 'Calculate by adding height/weight'}

### General Tips:
1. **Start where you are** - don't compare to others
2. **Consistency over intensity** - showing up matters most
3. **Listen to your body** - rest when needed
4. **Stay hydrated** - aim for 2.5-3L water daily
5. **Get adequate sleep** - 7-9 hours for recovery

### Sample Weekly Template:
- **Strength training**: 2-4 sessions
- **Cardio**: 2-3 sessions  
- **Flexibility**: Daily stretching (5-10 min)
- **Rest days**: 1-2 full rest days

### Want more specific advice?
Try asking about:
- "How to lose weight safely?"
- "Best exercises for muscle gain?"
- "How to stay motivated?"
- "Healthy meal prep ideas?"

I'm here to help with any fitness or nutrition questions!`;
    }
  };

  const generateProgressAnalysis = (user) => {
    return `## Your Fitness Progress Analysis

### Current Status:
Based on your profile, here's an assessment of your fitness journey:

**Strengths to Maintain:**
- ✅ You're actively tracking your fitness - this is the #1 predictor of success!
- ✅ Having a clear goal (${user?.fitnessGoal?.replace('_', ' ') || 'maintenance'}) gives direction
- ✅ Consistent tracking builds awareness and accountability

**Areas for Potential Improvement:**

### Nutrition:
- Focus on whole, unprocessed foods
- Track protein intake (aim for 1.6-2.2g per kg body weight)
- Consider meal prepping to stay on track

### Training:
- Ensure you're progressively overloading (adding weight/reps)
- Include both strength AND cardio for optimal results
- Don't neglect mobility and recovery work

### Lifestyle Factors:
- Sleep quality directly impacts fat loss and muscle gain
- Stress management affects hormone balance
- Hydration affects performance and appetite

### Recommended Next Steps:

**Short-term (Next 2 weeks):**
1. Log your meals consistently for awareness
2. Take progress photos and measurements
3. Set 3 small, achievable weekly goals

**Medium-term (Next 4-6 weeks):**
1. Review and adjust calorie/macro targets
2. Increase workout intensity or volume
3. Join a fitness community for accountability

**Long-term (3 months):**
1. Reassess goals based on progress
2. Try new activities to prevent boredom
3. Consider working with a personal trainer

### Motivational Message:
Every workout, every healthy meal, every glass of water is a step toward your goal. Progress isn't always linear, but consistency compounds over time. You've already taken the hardest step - starting!

Keep going! 💪`;
  };

  const features = [
    { id: 'advice', name: 'Fitness Advice', icon: '💬', description: 'Ask any fitness-related question' },
    { id: 'workout', name: 'Workout Plan', icon: '📋', description: 'Generate personalized workout routines' },
    { id: 'meal', name: 'Meal Plan', icon: '🍽️', description: 'Get customized meal plans' },
    { id: 'analyze', name: 'Analyze Progress', icon: '📊', description: 'Get insights on your progress' }
  ];

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ fontSize: '1.5rem' }}>🤖 AI Fitness Coach</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Your personal AI assistant for fitness, nutrition, and health guidance
          </p>
        </div>

        {/* Feature Selection */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '1.5rem' }}>
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`stat-card ${selectedFeature === feature.id ? 'active' : ''}`}
              onClick={() => setSelectedFeature(feature.id)}
              style={{
                cursor: 'pointer',
                border: selectedFeature === feature.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                backgroundColor: selectedFeature === feature.id ? '#f3e8ff' : 'white'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <h3 className="stat-title">{feature.name}</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {selectedFeature === 'advice' && (
            <div className="form-group">
              <label className="form-label">Your Question</label>
              <textarea
                name="question"
                className="form-input"
                value={formData.question}
                onChange={handleChange}
                required
                rows="4"
                placeholder="E.g., How can I lose belly fat? What should I eat before a workout? How to stay motivated?"
                style={{ resize: 'vertical' }}
              />
            </div>
          )}

          {selectedFeature === 'workout' && (
            <>
              <div className="row">
                <div className="form-group">
                  <label className="form-label">Fitness Goal</label>
                  <select name="goal" className="form-select" value={formData.goal} onChange={handleChange}>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (weeks)</label>
                  <input
                    type="number"
                    name="duration"
                    className="form-input"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="form-group">
                  <label className="form-label">Equipment Available</label>
                  <select name="equipment" className="form-select" value={formData.equipment} onChange={handleChange}>
                    <option value="none">No Equipment</option>
                    <option value="basic">Basic (Dumbbells, Bands)</option>
                    <option value="full">Full Gym Access</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select name="experience" className="form-select" value={formData.experience} onChange={handleChange}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Focus Area</label>
                <select name="focusArea" className="form-select" value={formData.focusArea} onChange={handleChange}>
                  <option value="full body">Full Body</option>
                  <option value="upper body">Upper Body</option>
                  <option value="lower body">Lower Body</option>
                  <option value="core">Core</option>
                  <option value="cardio">Cardio</option>
                </select>
              </div>
            </>
          )}

          {selectedFeature === 'meal' && (
            <>
              <div className="row">
                <div className="form-group">
                  <label className="form-label">Daily Calorie Target</label>
                  <input
                    type="number"
                    name="calories"
                    className="form-input"
                    value={formData.calories}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dietary Preference</label>
                  <select name="dietaryPreference" className="form-select" value={formData.dietaryPreference} onChange={handleChange}>
                    <option value="balanced">Balanced</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Get AI Response'}
          </button>
        </form>

        {/* Response Display */}
        {response && (
          <div style={{ marginTop: '2rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>AI Coach Response</h3>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              maxHeight: '500px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              {response.split('\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '1rem' }}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3e8ff', borderRadius: '0.5rem' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Tips for best results:</h4>
          <ul style={{ marginLeft: '1.5rem', color: '#4b5563' }}>
            <li>Be specific with your questions for better responses</li>
            <li>Provide context about your fitness level and goals</li>
            <li>Use the analyze feature regularly to track progress</li>
            <li>Combine AI recommendations with professional medical advice</li>
            <li>Save your favorite workout and meal plans for future reference</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
