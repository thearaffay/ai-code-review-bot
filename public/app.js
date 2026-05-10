async function reviewCode() {
  const code = document.getElementById('codeInput').value.trim();
  const language = document.getElementById('language').value;
  const context = document.getElementById('context').value.trim();
  
  if (!code) {
    showNotification('Please enter some code to review', 'error');
    return;
  }

  const loading = document.getElementById('loading');
  const output = document.getElementById('output');
  const reviewBtn = document.getElementById('reviewBtn');

  // Show loading
  loading.classList.remove('hidden');
  reviewBtn.disabled = true;
  output.innerHTML = '<div class="text-gray-500 text-center py-12"><i class="fas fa-spinner fa-spin text-4xl mb-4"></i><p>Analyzing code...</p></div>';

  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, language, context })
    });

    const data = await response.json();

    if (data.success) {
      displayReview(data.review, data.stats);
      showNotification('Code review complete!', 'success');
    } else {
      throw new Error(data.error || 'Failed to review code');
    }

  } catch (error) {
    console.error('Error:', error);
    output.innerHTML = `<div class="text-red-400 text-center py-12"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>${error.message}</p></div>`;
    showNotification('Error reviewing code', 'error');
  } finally {
    loading.classList.add('hidden');
    reviewBtn.disabled = false;
  }
}

function displayReview(review, stats) {
  const output = document.getElementById('output');
  
  const scoreColor = review.score >= 8 ? 'text-green-400' : review.score >= 6 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = review.score >= 8 ? 'bg-green-500/10 border-green-500/30' : review.score >= 6 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30';
  
  output.innerHTML = `
    <!-- Quality Score -->
    <div class="${scoreBg} border backdrop-blur-lg rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-400 mb-1">Quality Score</div>
          <div class="text-4xl font-bold ${scoreColor}">${review.score}/10</div>
        </div>
        <div class="text-6xl ${scoreColor}">
          ${review.score >= 8 ? '😊' : review.score >= 6 ? '😐' : '😟'}
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center gap-2 mb-3">
        <i class="fas fa-file-alt text-indigo-400"></i>
        <h3 class="font-bold text-lg">Summary</h3>
      </div>
      <p class="text-gray-300 leading-relaxed">${review.summary}</p>
    </div>

    <!-- Bugs -->
    ${createSection('Bugs & Issues', review.bugs, 'bug', 'red')}

    <!-- Security -->
    ${createSection('Security Concerns', review.security, 'shield-alt', 'orange')}

    <!-- Performance -->
    ${createSection('Performance Notes', review.performance, 'tachometer-alt', 'blue')}

    <!-- Violations -->
    ${createSection('Best Practice Violations', review.violations, 'exclamation-triangle', 'yellow')}

    <!-- Suggestions -->
    ${createSection('Suggestions', review.suggestions, 'lightbulb', 'purple')}

    <!-- Stats -->
    <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-400">Tokens Used: <span class="text-white font-semibold">${stats.tokensUsed}</span></span>
        <span class="text-gray-400">Model: <span class="text-white font-semibold">${stats.model}</span></span>
      </div>
    </div>
  `;
}

function createSection(title, items, icon, color) {
  if (!items || items.length === 0) {
    return `
      <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center gap-2 mb-3">
          <i class="fas fa-${icon} text-${color}-400"></i>
          <h3 class="font-bold text-lg">${title}</h3>
        </div>
        <div class="flex items-center gap-2 text-green-400">
          <i class="fas fa-check-circle"></i>
          <span>No issues found</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-${icon} text-${color}-400"></i>
        <h3 class="font-bold text-lg">${title}</h3>
        <span class="ml-auto bg-${color}-500/20 text-${color}-400 px-2 py-1 rounded-full text-xs font-semibold">${items.length}</span>
      </div>
      <ul class="space-y-2">
        ${items.map(item => `
          <li class="flex gap-3 text-sm">
            <span class="text-${color}-400 mt-1">•</span>
            <span class="text-gray-300">${item}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 z-50 ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Sample code examples
const samples = {
  javascript: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].quantity;
  }
  return total;
}`,
  
  python: `def find_max(numbers):
    max_num = numbers[0]
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num`,
  
  typescript: `interface User {
  name: string;
  email: string;
}

function greetUser(user: User) {
  console.log("Hello " + user.name);
}`
};

// Load sample on page load
window.addEventListener('load', () => {
  document.getElementById('codeInput').value = samples.javascript;
});
