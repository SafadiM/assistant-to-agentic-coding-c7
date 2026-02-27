import { useCallback, useSyncExternalStore } from "react";
import type { Config, CreateConfigDto, UpdateConfigDto } from "../types/config";
import * as api from "../api/config-api";

interface State {
  configs: Config[];
  selectedConfig: Config | null;
  loading: boolean;
  error: string | null;
}

let state: State = {
  configs: [],
  selectedConfig: null,
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();

function setState(partial: Partial<State>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): State {
  return state;
}

export function useConfigs() {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  const loadConfigs = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const configs = await api.getAllConfigs();
      setState({ configs, loading: false });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  const loadConfig = useCallback(async (key: string) => {
    setState({ loading: true, error: null });
    try {
      const config = await api.getConfig(key);
      setState({ selectedConfig: config, loading: false });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  const createConfig = useCallback(async (data: CreateConfigDto) => {
    setState({ loading: true, error: null });
    try {
      await api.createConfig(data);
      const configs = await api.getAllConfigs();
      setState({ configs, loading: false });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  }, []);

  const updateConfig = useCallback(async (key: string, data: UpdateConfigDto) => {
    setState({ loading: true, error: null });
    try {
      await api.updateConfig(key, data);
      const configs = await api.getAllConfigs();
      setState({ configs, loading: false });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  }, []);

  const deleteConfig = useCallback(async (key: string) => {
    setState({ loading: true, error: null });
    try {
      await api.deleteConfig(key);
      const configs = await api.getAllConfigs();
      setState({ configs, loading: false });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  }, []);

  return { ...current, loadConfigs, loadConfig, createConfig, updateConfig, deleteConfig };
}
