#!/bin/bash

# Function to create a new pane or use the current one
create_or_use_pane() {
  local session_name=$1
  local pane_name=$2
  local command=$3

  # Create a new pane
  tmux split-window -t "$session_name"

  # Send the command to the new pane
  tmux send-keys -t "$session_name" "$command" C-m

  # Name the pane
  tmux select-pane -t "$session_name" -T "$pane_name"

}

# Generate a unique session name
session_name="vulnDash_$(date +%s)"

# Check if we're already in a tmux session
if [ -n "$TMUX" ]; then

  # We're inside a tmux session, use the current session
  current_session=$(tmux display-message -p '#S')

  # Clear the current pane and use it for frontend
  tmux send-keys C-c
  tmux send-keys "clear" C-m
  tmux send-keys "cd ~/projects/vulnDash/vulndash && npm start" C-m

  tmux select-pane -T "frontend"

  # Create pane for backend
  create_or_use_pane "$current_session" "backend" "cd ~/projects/vulnDash/backend && npm run dev"

  # Create pane for user
  create_or_use_pane "$current_session" "user" ""

  # Arrange panes

  tmux select-layout tiled

  # Select the user pane
  tmux select-pane -t "$current_session" -T "user"

else
  # We're not in a tmux session, create a new one
  tmux new-session -d -s "$session_name" -n vulnDash

  # Set up frontend in the first pane
  tmux send-keys -t "$session_name" "cd ~/projects/vulnDash/vulndash && npm start" C-m
  tmux select-pane -t "$session_name" -T "frontend"

  # Create pane for backend

  create_or_use_pane "$session_name" "backend" "cd ~/projects/vulnDash/backend && npm run dev"

  # Create pane for user
  create_or_use_pane "$session_name" "user" ""

  # Arrange panes
  tmux select-layout -t "$session_name" tiled

  # Select the user pane
  tmux select-pane -t "$session_name" -T "user"

  # Attach to the session
  tmux attach-session -t "$session_name"
fi

echo "Session '$session_name' created with frontend, backend, and user panes."
