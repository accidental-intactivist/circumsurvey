export function getPendingProposals() {
  try {
    const stored = localStorage.getItem('editorial_proposals');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  
  // Default mock proposals
  const initial = [
    {
      id: 'prop_1',
      type: 'feature_exhibit',
      target: 'pleasure-gap',
      badge: 'Trending',
      reason: 'The Pleasure Gap exhibit has 300% higher dwell time this week.',
      status: 'pending' // pending, approved, rejected
    },
    {
      id: 'prop_2',
      type: 'feature_question',
      target: 'q187', // 187 is a sample question
      reason: 'Users are repeatedly searching for answers related to this topic.',
      status: 'pending'
    },
    {
      id: 'prop_3',
      type: 'reorder_exhibit',
      target: 'culture',
      newPosition: 0, // front
      reason: 'High volume of external shares originating from this exhibit.',
      status: 'pending'
    }
  ];
  saveProposals(initial);
  return initial;
}

export function saveProposals(proposals) {
  try {
    localStorage.setItem('editorial_proposals', JSON.stringify(proposals));
  } catch(e) {}
}

export function approveProposal(proposalId, currentConfig, updateConfig) {
  const props = getPendingProposals();
  const prop = props.find(p => p.id === proposalId);
  if (prop) {
    prop.status = 'approved';
    saveProposals(props);
    
    // Apply changes
    const newConfig = { ...currentConfig };
    
    if (prop.type === 'feature_exhibit') {
      newConfig.featuredExhibits = {
        ...newConfig.featuredExhibits,
        [prop.target]: { badge: prop.badge || 'Featured' }
      };
    } else if (prop.type === 'feature_question') {
      newConfig.featuredQuestions = [...(newConfig.featuredQuestions || []), prop.target];
    } else if (prop.type === 'reorder_exhibit') {
      const order = [...(newConfig.exhibitOrder || [])];
      // Note: If order is empty, we need the default order from ExhibitsDashboard first
      // But for simplicity, we'll just push it. ExhibitsDashboard will handle it.
      if (!order.includes(prop.target)) {
        order.unshift(prop.target);
      }
      newConfig.exhibitOrder = order;
    }
    
    updateConfig(newConfig);
  }
}

export function rejectProposal(proposalId) {
  const props = getPendingProposals();
  const prop = props.find(p => p.id === proposalId);
  if (prop) {
    prop.status = 'rejected';
    saveProposals(props);
  }
}

export function resetProposals() {
  localStorage.removeItem('editorial_proposals');
}
