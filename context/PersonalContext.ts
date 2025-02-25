import createDataContext from "../utils/CreateDataContext";
import axios from "../utils/AxiosBase";
import { Dispatch } from "react";
import * as RootNavigation from "../utils/NavigationRef";

import { TaskType } from "../constants/TaskType";
import { Alert } from "react-native";
import { wait } from "../utils/Wait";

// Declare State and Action type
export type PersonalStateType = {
  tasks: TaskType[];
  errorMessage: string;
};

export type PersonalActionType =
  | { type: "clear_task" }
  | {
      type: "add_task";
      payload: TaskType;
    }
  | { type: "load_task"; payload: TaskType[] }
  | { type: "update_task"; payload: TaskType }
  | { type: "add_err"; payload: { errorMessage: string } }
  | { type: "clear_err" };

// Declare type PROPS for createNewTask function
export type NewPersonalTaskType = {
  username: string;
  taskData: TaskType;
  setLoading: (props: boolean) => void;
};

// Declare type PROPS for loadTask function
export type LoadPersonalTaskType = {
  username: string;
};

export type UpdatePersonalTask = {
  username: string;
  taskData: TaskType;
  setLoading: (props: boolean) => void;
};

const personalReducer = (
  state: PersonalStateType,
  action: PersonalActionType
) => {
  switch (action.type) {
    case "clear_task":
      return {
        ...state,
        tasks: [],
      };
    case "add_task":
      return {
        tasks: [
          ...state.tasks,
          {
            pkTask_Id: action.payload.pkTask_Id,
            title: action.payload.title,
            content: action.payload.content,
            start: action.payload.start,
            due: action.payload.due,
            color: action.payload.color,
            done: action.payload.done,
          },
        ],
      };
    case "load_task":
      return {
        ...state,
        tasks: action.payload,
      };
    case "update_task":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.pkTask_Id === action.payload.pkTask_Id ? action.payload : task
        ),
      };
    case "add_err":
      return {
        ...state,
        errorMessage: action.payload.errorMessage,
      };
    case "clear_err":
      return {
        ...state,
        errorMessage: "",
      };
    default:
      return state;
  }
};

const createNewTask = (dispatch: Dispatch<PersonalActionType>) => {
  return async ({ username, taskData, setLoading }: NewPersonalTaskType) => {
    try {
      const res = await axios.post("/task/personal/" + username, {
        ...taskData,
        taskType: "Personal",
      });
      wait(1500).then(() => {
        setLoading(false);
        if (res.data.effect) {
          dispatch({
            type: "add_task",
            payload: { ...taskData, pkTask_Id: res.data.pkTask_Id },
          });
          RootNavigation.dispatch("PersonalTask");
          setTimeout(() => {
            Alert.alert("Your personal task has been created successfully!");
          }, 100);
        } else {
          setTimeout(() => {
            Alert.alert("Something went wrong!");
            dispatch({
              type: "add_err",
              payload: { errorMessage: "Create new personal task failed" },
            });
          }, 100);
        }
      });
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
};

const loadTask = (dispatch: Dispatch<PersonalActionType>) => {
  return async ({ username }: LoadPersonalTaskType) => {
    try {
      const res = await axios.get("/task/personal/" + username);
      // Format the response data to local state
      const taskData: TaskType[] = res.data.map((task: any) => {
        return {
          pkTask_Id: task.pkTask_Id,
          title: task.title,
          content: task.content,
          start: task.start.slice(0, 19).replace("T", " "),
          due: task.due.slice(0, 19).replace("T", " "),
          done: task.done,
          color: task.color,
        };
      });
      dispatch({ type: "load_task", payload: taskData });
    } catch (err) {
      console.log(err);
    }
  };
};

const updateTask = (dispatch: Dispatch<PersonalActionType>) => {
  return async ({ username, taskData, setLoading }: UpdatePersonalTask) => {
    try {
      const res = await axios.put(
        `/task/personal/${username}/${taskData.pkTask_Id}`,
        {
          ...taskData,
          taskType: "Personal",
        }
      );
      wait(1500).then(() => {
        setLoading(false);
        if (res.data.effect) {
          dispatch({
            type: "update_task",
            payload: taskData,
          });
          RootNavigation.dispatch("PersonalTask");
          setTimeout(() => {
            Alert.alert("Your personal task has been updated successfully!");
          }, 100);
        } else {
          setTimeout(() => {
            Alert.alert("Something went wrong!");
          }, 100);
          dispatch({
            type: "add_err",
            payload: { errorMessage: "Update personal task failed" },
          });
        }
      });
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
};

export const { Provider, Context } = createDataContext(
  personalReducer,
  { createNewTask, loadTask, updateTask },
  { tasks: [], errorMessage: "" }
);
