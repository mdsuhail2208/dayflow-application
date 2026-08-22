export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string;
          check_in: string | null;
          check_out: string | null;
          created_at: string;
          employee_id: string;
          id: string;
        };
        Insert: {
          attendance_date?: string;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
          employee_id: string;
          id?: string;
        };
        Update: {
          attendance_date?: string;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
          employee_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          address: string | null;
          created_at: string;
          date_of_joining: string | null;
          department_id: string | null;
          designation: string | null;
          id: string;
          manager_id: string | null;
          name: string;
          phone: string | null;
          photo_url: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          date_of_joining?: string | null;
          department_id?: string | null;
          designation?: string | null;
          id?: string;
          manager_id?: string | null;
          name: string;
          phone?: string | null;
          photo_url?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          date_of_joining?: string | null;
          department_id?: string | null;
          designation?: string | null;
          id?: string;
          manager_id?: string | null;
          name?: string;
          phone?: string | null;
          photo_url?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employees_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      leave_balances: {
        Row: {
          created_at: string;
          employee_id: string;
          id: string;
          leave_type_id: string;
          total_days: number;
          used_days: number;
        };
        Insert: {
          created_at?: string;
          employee_id: string;
          id?: string;
          leave_type_id: string;
          total_days?: number;
          used_days?: number;
        };
        Update: {
          created_at?: string;
          employee_id?: string;
          id?: string;
          leave_type_id?: string;
          total_days?: number;
          used_days?: number;
        };
        Relationships: [
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey";
            columns: ["leave_type_id"];
            isOneToOne: false;
            referencedRelation: "leave_types";
            referencedColumns: ["id"];
          },
        ];
      };
      leave_types: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          employee_id: string;
          file_name: string;
          file_url: string;
          id: string;
          type: "id_proof" | "offer_letter" | "resume" | "other";
          uploaded_at: string;
        };
        Insert: {
          employee_id: string;
          file_name: string;
          file_url: string;
          id?: string;
          type: "id_proof" | "offer_letter" | "resume" | "other";
          uploaded_at?: string;
        };
        Update: {
          employee_id?: string;
          file_name?: string;
          file_url?: string;
          id?: string;
          type?: "id_proof" | "offer_letter" | "resume" | "other";
          uploaded_at?: string;
        };
        Relationships: [];
      };
      leave_requests: {
        Row: {
          approver_comment: string | null;
          created_at: string;
          employee_id: string;
          end_date: string;
          id: string;
          leave_type_id: string;
          remarks: string | null;
          start_date: string;
          status: "pending" | "approved" | "rejected";
          updated_at: string;
        };
        Insert: {
          approver_comment?: string | null;
          created_at?: string;
          employee_id: string;
          end_date: string;
          id?: string;
          leave_type_id: string;
          remarks?: string | null;
          start_date: string;
          status?: "pending" | "approved" | "rejected";
          updated_at?: string;
        };
        Update: {
          approver_comment?: string | null;
          created_at?: string;
          employee_id?: string;
          end_date?: string;
          id?: string;
          leave_type_id?: string;
          remarks?: string | null;
          start_date?: string;
          status?: "pending" | "approved" | "rejected";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey";
            columns: ["leave_type_id"];
            isOneToOne: false;
            referencedRelation: "leave_types";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          message: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      onboarding_tasks: {
        Row: {
          created_at: string;
          employee_id: string;
          id: string;
          is_complete: boolean;
          task_name: string;
        };
        Insert: {
          created_at?: string;
          employee_id: string;
          id?: string;
          is_complete?: boolean;
          task_name: string;
        };
        Update: {
          created_at?: string;
          employee_id?: string;
          id?: string;
          is_complete?: boolean;
          task_name?: string;
        };
        Relationships: [];
      };
      payroll: {
        Row: {
          allowances: number;
          basic: number;
          created_at: string;
          deductions: number;
          employee_id: string;
          hra: number;
          id: string;
          month: string;
          net_pay: number;
        };
        Insert: {
          allowances?: number;
          basic?: number;
          created_at?: string;
          deductions?: number;
          employee_id: string;
          hra?: number;
          id?: string;
          month: string;
          net_pay?: number;
        };
        Update: {
          allowances?: number;
          basic?: number;
          created_at?: string;
          deductions?: number;
          employee_id?: string;
          hra?: number;
          id?: string;
          month?: string;
          net_pay?: number;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "employee" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["employee", "admin"],
    },
  },
} as const;
