// Taux de change de base (à remplacer par une API ou une mise à jour dynamique)
const BASE_RATES = {
  'XAF': {
    'USD': 0.0018,
    'EUR': 0.0015,
    'GBP': 0.0013,
    'CAD': 0.0022,
  },
  'USD': {
    'XAF': 625,
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.36,
  },
  'EUR': {
    'XAF': 666.67,
    'USD': 1.09,
    'GBP': 0.86,
    'CAD': 1.48,
  },
  'GBP': {
    'XAF': 769.23,
    'USD': 1.27,
    'EUR': 1.16,
    'CAD': 1.72,
  },
  'CAD': {
    'XAF': 454.55,
    'USD': 0.74,
    'EUR': 0.68,
    'GBP': 0.58,
  },
};

// Fonction pour obtenir le taux de change entre deux devises
export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  return BASE_RATES[fromCurrency]?.[toCurrency] || null;
};

// Fonction pour simuler un échange
export const simulateExchange = (fromCurrency, toCurrency, amount) => {
  if (!fromCurrency || !toCurrency || !amount || isNaN(amount) || amount <= 0) {
    return {
      error: 'Paramètres invalides',
      success: false
    };
  }

  const rate = getExchangeRate(fromCurrency, toCurrency);
  
  if (rate === null) {
    // Essayer de trouver un taux inverse
    const reverseRate = getExchangeRate(toCurrency, fromCurrency);
    if (reverseRate === null) {
      return {
        error: `Taux de change non disponible pour ${fromCurrency} vers ${toCurrency}`,
        success: false
      };
    }
    
    const convertedAmount = amount / reverseRate;
    const feePercentage = 0.01; // 1% de frais
    const feeAmount = convertedAmount * feePercentage;
    const netReceived = convertedAmount - feeAmount;
    
    return {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount_sent: parseFloat(amount),
      amount: parseFloat(amount), // Pour la rétrocompatibilité
      rate: 1 / reverseRate,
      exchange_rate: 1 / reverseRate, // Pour la cohérence
      converted_amount: convertedAmount,
      fee_percentage: feePercentage * 100, // En pourcentage
      fee_amount: feeAmount,
      net_received: netReceived,
      last_updated: new Date().toISOString(),
      success: true
    };
  }
  
  const convertedAmount = amount * rate;
  const feePercentage = 0.01; // 1% de frais
  const feeAmount = convertedAmount * feePercentage;
  const netReceived = convertedAmount - feeAmount;
  
  return {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    amount_sent: parseFloat(amount),
    amount: parseFloat(amount), // Pour la rétrocompatibilité
    rate: rate,
    exchange_rate: rate, // Pour la cohérence
    converted_amount: convertedAmount,
    fee_percentage: feePercentage * 100, // En pourcentage
    fee_amount: feeAmount,
    net_received: netReceived,
    last_updated: new Date().toISOString(),
    success: true
  };
};

// Fonction pour enregistrer une simulation dans le localStorage
export const saveSimulationToHistory = (simulation) => {
  try {
    const history = JSON.parse(localStorage.getItem('exchangeHistory') || '[]');
    history.unshift({
      ...simulation,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    
    // Garder uniquement les 50 dernières simulations
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem('exchangeHistory', JSON.stringify(limitedHistory));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la simulation:', error);
    return false;
  }
};

// Fonction pour récupérer l'historique des simulations
export const getSimulationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('exchangeHistory') || '[]');
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

export const CURRENCIES = [
  { value: 'XAF', label: 'Franc CFA (XAF)' },
  { value: 'USD', label: 'Dollar américain (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
  { value: 'CAD', label: 'Dollar canadien (CAD)' },
];
