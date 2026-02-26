import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

export function useTasks() {
    return useContext(TaskContext);
}
