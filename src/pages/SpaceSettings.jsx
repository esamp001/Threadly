import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GavelIcon from '@mui/icons-material/Gavel';
import { Box, Button, Container, Paper, Skeleton, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/HomeComponents/BottomNav';
import CustomButton from '../components/HomeComponents/CustomButton';
import Header from '../components/HomeComponents/Header';
import ConfirmationDialog from '../components/Notifications/ConfirmationDialog';
import apiRequest from '../config/api';
import { useAuth } from '../context/AuthContext/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

/**
 * SpaceSettings page for managing space settings
 * This is the source of truth for space owners to manage their space configuration
 * Currently supports rules management only (extensible for future settings)
 */
const SpaceSettings = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [space, setSpace] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRuleText, setNewRuleText] = useState('');
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editingRuleText, setEditingRuleText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [isAddingRule, setIsAddingRule] = useState(false);

  // Fetch space details
  const fetchSpace = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/spaces/${spaceId}`);
      const result = await response.json();

      if (response.ok && result.space) {
        setSpace(result.space);
        // Check if user is owner
        if (result.space.userRole !== 'owner') {
          showSnackbar('Only space owners can access settings', 'error');
          navigate(`/spaces/${spaceId}`);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load space', 'error');
    } finally {
      setLoading(false);
    }
  }, [spaceId, showSnackbar, navigate]);

  // Fetch rules for the space
  const fetchRules = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/rules`);
      const result = await response.json();

      if (response.ok) {
        setRules(result.rules || []);
      }
    } catch (error) {
      showSnackbar('Failed to load rules', 'error');
    }
  }, [spaceId, showSnackbar]);

  // Fetch data on mount
  useEffect(() => {
    if (spaceId) {
      fetchSpace();
      fetchRules();
    }
  }, [spaceId, fetchSpace, fetchRules]);

  /**
   * Add a new rule to the space
   * This is used to create a new space rule
   */
  const handleAddRule = useCallback(async () => {
    if (!newRuleText.trim()) {
      showSnackbar('Rule text cannot be empty', 'error');
      return;
    }

    setIsAddingRule(true);

    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/rules`, {
        method: 'POST',
        body: JSON.stringify({ rule_text: newRuleText })
      });
      const result = await response.json();

      if (response.ok) {
        showSnackbar('Rule added successfully', 'success');
        setNewRuleText('');
        setShowAddRule(false);
        fetchRules();
      } else {
        showSnackbar(result.error_message || 'Failed to add rule', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to add rule', 'error');
    } finally {
      setIsAddingRule(false);
    }
  }, [newRuleText, spaceId, showSnackbar, fetchRules]);

  /**
   * Update an existing rule
   * This is used to edit a space rule
   */
  const handleUpdateRule = useCallback(async (ruleId) => {
    if (!editingRuleText.trim()) {
      showSnackbar('Rule text cannot be empty', 'error');
      return;
    }

    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify({ rule_text: editingRuleText })
      });
      const result = await response.json();

      if (response.ok) {
        showSnackbar('Rule updated successfully', 'success');
        setEditingRuleId(null);
        setEditingRuleText('');
        fetchRules();
      } else {
        showSnackbar(result.error_message || 'Failed to update rule', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update rule', 'error');
    }
  }, [editingRuleText, spaceId, showSnackbar, fetchRules]);

  /**
   * Delete a rule from the space
   * This is used to remove a space rule
   */
  const handleDeleteRule = useCallback(async () => {
    if (!ruleToDelete) return;

    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/rules/${ruleToDelete}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok) {
        showSnackbar('Rule deleted successfully', 'success');
        setDeleteDialogOpen(false);
        setRuleToDelete(null);
        fetchRules();
      } else {
        showSnackbar(result.error_message || 'Failed to delete rule', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete rule', 'error');
    }
  }, [ruleToDelete, spaceId, showSnackbar, fetchRules]);

  /**
   * Handle drag end event for reordering rules
   * This is used to update the local state and sync with backend
   */
  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination) return;

    const items = Array.from(rules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRules(items);

    // Sync with backend
    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/rules/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ ruleIds: items.map(rule => rule.id) })
      });
      const result = await response.json();

      if (!response.ok) {
        showSnackbar(result.error_message || 'Failed to reorder rules', 'error');
        fetchRules(); // Revert to original order
      }
    } catch (error) {
      showSnackbar('Failed to reorder rules', 'error');
      fetchRules(); // Revert to original order
    }
  }, [rules, spaceId, showSnackbar, fetchRules]);

  // Show loading state
  if (loading || !space) {
    return (
      <Container maxWidth="lg">
        <Header
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          onSpaceCreated={() => { }}
        />
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={200} height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={150} height={30} sx={{ mb: 4 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Header
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        onSpaceCreated={() => { }}
      />

      <Box sx={{ mt: 4, mb: 4 }}>

        {/* Page Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Cosmic Lounge
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af' }}>
              {space?.name || 'Space'}
            </Typography>
          </Box>
          <CustomButton
            onClick={() => setShowAddRule(!showAddRule)}
            sx={{ minWidth: { xs: '100%', sm: 120 } }}
            startIcon={<GavelIcon />}
          >
            {showAddRule ? 'Cancel' : 'Add Rule'}
          </CustomButton>
        </Box>

        {/* Rules Section */}
        <Paper sx={{ backgroundColor: 'paper.backgroundColor', p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
            <Typography variant="h6">
              Existing Rules
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Manage and reorder guidelines for this space.
            </Typography>
          </Box>

          {/* Add New Rule Form */}
          {showAddRule && (
            <Box sx={{ display: 'flex', gap: 2, mb: 4, animation: 'fadeIn 0.3s ease-in-out' }}>
              <TextField
                fullWidth
                placeholder="Enter a new rule..."
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRule();
                  }
                }}
                autoFocus
                variant="standard"
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#d1d5db',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddRule}
                disabled={!newRuleText.trim() || isAddingRule}
                sx={{
                  backgroundColor: '#22c55e',
                  '&:hover': {
                    backgroundColor: '#16a34a',
                  },
                }}
              >
                {isAddingRule ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}

          {/* Rules List */}
          {rules.length === 0 ? (
            <Typography sx={{ color: '#9ca3af', textAlign: 'center', py: 4 }}>
              No rules set yet. Click "Add Rule" to create your first rule.
            </Typography>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="rules">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {rules.map((rule, index) => (
                      <Draggable key={rule.id} draggableId={String(rule.id)} index={index}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              backgroundColor: snapshot.isDragging ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                              borderRadius: 1,
                              padding: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Box {...provided.dragHandleProps} sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
                              <DragIndicatorIcon sx={{ color: '#9ca3af' }} />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              {rule.rule_text}
                            </Box>
                            <Typography
                              sx={{
                                minWidth: 40,
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'primary.main',
                              }}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </Typography>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRuleToDelete(null);
        }}
        onConfirm={handleDeleteRule}
        title="Delete Rule"
        subMessage="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Bottom Navigation */}
      <BottomNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
    </Container>
  );
};

export default SpaceSettings;
