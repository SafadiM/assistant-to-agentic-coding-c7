import type { Config } from "../types/config.js";
import * as configApi from "../api/config-api.js";
import type { CreateConfigDto, UpdateConfigDto } from "../types/config.js";

export interface ConfigStoreState {
  configs: Config[];
  selectedConfig: Config | null;
  loading: boolean;
  error: string | null;
}

class ConfigStore extends EventTarget {
  private state: ConfigStoreState = {
    configs: [],
    selectedConfig: null,
    loading: false,
    error: null,
  };

  getState(): Readonly<ConfigStoreState> {
    return Object.freeze({ ...this.state });
  }

  private setState(partial: Partial<ConfigStoreState>) {
    this.state = { ...this.state, ...partial };
    this.dispatchEvent(new CustomEvent("state-change"));
  }

  async loadConfigs(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const configs = await configApi.getAllConfigs();
      this.setState({ configs, loading: false });
    } catch (err) {
      this.setState({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async loadConfig(key: string): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const config = await configApi.getConfig(key);
      this.setState({ selectedConfig: config, loading: false });
    } catch (err) {
      this.setState({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async createConfig(data: CreateConfigDto): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      await configApi.createConfig(data);
      await this.loadConfigs();
    } catch (err) {
      this.setState({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  async updateConfig(key: string, data: UpdateConfigDto): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      await configApi.updateConfig(key, data);
      await this.loadConfigs();
    } catch (err) {
      this.setState({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  async deleteConfig(key: string): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      await configApi.deleteConfig(key);
      await this.loadConfigs();
    } catch (err) {
      this.setState({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

export const store = new ConfigStore();
