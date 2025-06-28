--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_ApprovalHistories_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ApprovalHistories_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."enum_ApprovalHistories_status" OWNER TO postgres;

--
-- Name: enum_Contracts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Contracts_status" AS ENUM (
    'draft',
    'active',
    'expired',
    'terminated',
    'pending_approval',
    'rejected'
);


ALTER TYPE public."enum_Contracts_status" OWNER TO postgres;

--
-- Name: enum_DelegationOfAuthorities_documentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_DelegationOfAuthorities_documentType" AS ENUM (
    'PR',
    'PO',
    'Contract',
    'All'
);


ALTER TYPE public."enum_DelegationOfAuthorities_documentType" OWNER TO postgres;

--
-- Name: enum_Inventories_condition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Inventories_condition" AS ENUM (
    'A',
    'B',
    'C',
    'D',
    'E',
    'N'
);


ALTER TYPE public."enum_Inventories_condition" OWNER TO postgres;

--
-- Name: enum_ItemMasters_criticality; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ItemMasters_criticality" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW',
    'NO'
);


ALTER TYPE public."enum_ItemMasters_criticality" OWNER TO postgres;

--
-- Name: enum_ItemMasters_plannedStock; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ItemMasters_plannedStock" AS ENUM (
    'Y',
    'N'
);


ALTER TYPE public."enum_ItemMasters_plannedStock" OWNER TO postgres;

--
-- Name: enum_ItemMasters_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ItemMasters_status" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."enum_ItemMasters_status" OWNER TO postgres;

--
-- Name: enum_ItemMasters_stockCode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ItemMasters_stockCode" AS ENUM (
    'ST1',
    'ST2',
    'NS3'
);


ALTER TYPE public."enum_ItemMasters_stockCode" OWNER TO postgres;

--
-- Name: enum_ItemMasters_stockItem; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ItemMasters_stockItem" AS ENUM (
    'Y',
    'N'
);


ALTER TYPE public."enum_ItemMasters_stockItem" OWNER TO postgres;

--
-- Name: enum_PurchaseOrderItems_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PurchaseOrderItems_status" AS ENUM (
    'pending',
    'partial',
    'received',
    'cancelled'
);


ALTER TYPE public."enum_PurchaseOrderItems_status" OWNER TO postgres;

--
-- Name: enum_PurchaseOrders_approvalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PurchaseOrders_approvalStatus" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."enum_PurchaseOrders_approvalStatus" OWNER TO postgres;

--
-- Name: enum_PurchaseOrders_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PurchaseOrders_status" AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'sent',
    'acknowledged',
    'partially_received',
    'completed',
    'cancelled'
);


ALTER TYPE public."enum_PurchaseOrders_status" OWNER TO postgres;

--
-- Name: enum_PurchaseOrders_urgency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PurchaseOrders_urgency" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public."enum_PurchaseOrders_urgency" OWNER TO postgres;

--
-- Name: enum_PurchaseRequisitionItems_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PurchaseRequisitionItems_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'ordered',
    'delivered'
);


ALTER TYPE public."enum_PurchaseRequisitionItems_status" OWNER TO postgres;

--
-- Name: enum_PurchaseRequisitions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PurchaseRequisitions_status" AS ENUM (
    'draft',
    'submitted',
    'approved',
    'partially_approved',
    'rejected',
    'completed'
);


ALTER TYPE public."enum_PurchaseRequisitions_status" OWNER TO postgres;

--
-- Name: enum_ReorderRequests_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ReorderRequests_status" AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'CONVERTED_TO_PR',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."enum_ReorderRequests_status" OWNER TO postgres;

--
-- Name: enum_RequestForQuotations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_RequestForQuotations_status" AS ENUM (
    'draft',
    'sent',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public."enum_RequestForQuotations_status" OWNER TO postgres;

--
-- Name: enum_RfqSuppliers_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_RfqSuppliers_status" AS ENUM (
    'pending',
    'sent',
    'responded',
    'selected',
    'rejected'
);


ALTER TYPE public."enum_RfqSuppliers_status" OWNER TO postgres;

--
-- Name: enum_Suppliers_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Suppliers_status" AS ENUM (
    'active',
    'inactive',
    'pending_approval',
    'rejected',
    'pending_supplier_acceptance'
);


ALTER TYPE public."enum_Suppliers_status" OWNER TO postgres;

--
-- Name: enum_Suppliers_supplierType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Suppliers_supplierType" AS ENUM (
    'transactional',
    'strategic',
    'preferred',
    'blacklisted'
);


ALTER TYPE public."enum_Suppliers_supplierType" OWNER TO postgres;

--
-- Name: enum_Transactions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Transactions_status" AS ENUM (
    'DRAFT',
    'PENDING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."enum_Transactions_status" OWNER TO postgres;

--
-- Name: enum_Transactions_transactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Transactions_transactionType" AS ENUM (
    'GR',
    'GI',
    'GE',
    'GT'
);


ALTER TYPE public."enum_Transactions_transactionType" OWNER TO postgres;

--
-- Name: enum_UnspscCodes_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_UnspscCodes_level" AS ENUM (
    'SEGMENT',
    'FAMILY',
    'CLASS',
    'COMMODITY'
);


ALTER TYPE public."enum_UnspscCodes_level" OWNER TO postgres;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'staff',
    'manager',
    'inventory_manager',
    'warehouse_manager',
    'procurement_manager'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

--
-- Name: enum_contracts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_contracts_status AS ENUM (
    'draft',
    'pending_review',
    'pending_approval',
    'pending_supplier_acceptance',
    'active',
    'expired',
    'terminated',
    'rejected'
);


ALTER TYPE public.enum_contracts_status OWNER TO postgres;

--
-- Name: enum_user_unspsc_favorites_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_user_unspsc_favorites_level AS ENUM (
    'SEGMENT',
    'FAMILY',
    'CLASS',
    'COMMODITY'
);


ALTER TYPE public.enum_user_unspsc_favorites_level OWNER TO postgres;

--
-- Name: enum_user_unspsc_hierarchy_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_user_unspsc_hierarchy_level AS ENUM (
    'SEGMENT',
    'FAMILY',
    'CLASS',
    'COMMODITY'
);


ALTER TYPE public.enum_user_unspsc_hierarchy_level OWNER TO postgres;

--
-- Name: rfq_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rfq_status AS ENUM (
    'draft',
    'sent',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public.rfq_status OWNER TO postgres;

--
-- Name: rfq_supplier_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rfq_supplier_status AS ENUM (
    'pending',
    'sent',
    'responded',
    'selected',
    'rejected'
);


ALTER TYPE public.rfq_supplier_status OWNER TO postgres;

--
-- Name: create_uuid_extension(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_uuid_extension() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'uuid-ossp extension might already exist';
END;
$$;


ALTER FUNCTION public.create_uuid_extension() OWNER TO postgres;

--
-- Name: get_column_names(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_column_names(tablename text) RETURNS TABLE(column_name text)
    LANGUAGE plpgsql
    AS $$
      BEGIN
        RETURN QUERY SELECT column_name::text
        FROM information_schema.columns
        WHERE table_name = tablename
        AND table_schema = 'public';
      END;
      $$;


ALTER FUNCTION public.get_column_names(tablename text) OWNER TO postgres;

--
-- Name: get_item_contract_price(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_item_contract_price(item_id uuid, supplier_id uuid) RETURNS TABLE(contract_id uuid, contract_item_id uuid, unit_price numeric, currency character varying, contract_number character varying, contract_name character varying)
    LANGUAGE plpgsql
    AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          c.id as contract_id,
          ci.id as contract_item_id,
          ci."unitPrice" as unit_price,
          ci.currency,
          c."contractNumber" as contract_number,
          c."contractName" as contract_name
        FROM "Contracts" c
        JOIN "ContractItems" ci ON c.id = ci."contractId"
        WHERE ci."itemId" = item_id
          AND c."supplierId" = supplier_id
          AND c.status = 'active'
          AND c."endDate" >= CURRENT_DATE
        ORDER BY c."startDate" DESC
        LIMIT 1;
      END;
      $$;


ALTER FUNCTION public.get_item_contract_price(item_id uuid, supplier_id uuid) OWNER TO postgres;

--
-- Name: sync_user_name_columns(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_user_name_columns() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          -- When firstName/lastName are updated, update first_name/last_name
          IF NEW."firstName" IS NOT NULL THEN
            NEW.first_name := NEW."firstName";
          END IF;
          
          IF NEW."lastName" IS NOT NULL THEN
            NEW.last_name := NEW."lastName";
          END IF;
          
          -- When first_name/last_name are updated, update firstName/lastName
          IF NEW.first_name IS NOT NULL AND (NEW."firstName" IS NULL OR NEW.first_name <> NEW."firstName") THEN
            NEW."firstName" := NEW.first_name;
          END IF;
          
          IF NEW.last_name IS NOT NULL AND (NEW."lastName" IS NULL OR NEW.last_name <> NEW."lastName") THEN
            NEW."lastName" := NEW.last_name;
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.sync_user_name_columns() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ApprovalHistories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ApprovalHistories" (
    id integer NOT NULL,
    "referenceId" uuid NOT NULL,
    "referenceType" character varying(255) NOT NULL,
    "approverId" uuid NOT NULL,
    level integer NOT NULL,
    status public."enum_ApprovalHistories_status" DEFAULT 'pending'::public."enum_ApprovalHistories_status",
    comments text,
    "actionDate" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ApprovalHistories" OWNER TO postgres;

--
-- Name: ApprovalHistories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ApprovalHistories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ApprovalHistories_id_seq" OWNER TO postgres;

--
-- Name: ApprovalHistories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ApprovalHistories_id_seq" OWNED BY public."ApprovalHistories".id;


--
-- Name: BinLocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BinLocations" (
    id uuid NOT NULL,
    "binCode" character varying(255) NOT NULL,
    description character varying(255) DEFAULT ''::character varying,
    "isActive" boolean DEFAULT true,
    "storageLocationId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public."BinLocations" OWNER TO postgres;

--
-- Name: ContractItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContractItems" (
    id uuid NOT NULL,
    "contractId" uuid NOT NULL,
    "itemNumber" character varying(255),
    description text NOT NULL,
    uom character varying(255) NOT NULL,
    "unitPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "leadTime" integer,
    "minimumOrderQuantity" numeric(15,2),
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ContractId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ContractItems" OWNER TO postgres;

--
-- Name: COLUMN "ContractItems"."leadTime"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ContractItems"."leadTime" IS 'Lead time in days';


--
-- Name: COLUMN "ContractItems"."minimumOrderQuantity"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ContractItems"."minimumOrderQuantity" IS 'Minimum order quantity for this item';


--
-- Name: Contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contracts" (
    id uuid NOT NULL,
    "contractNumber" character varying(255) NOT NULL,
    "contractName" character varying(255) NOT NULL,
    description text,
    "supplierId" uuid NOT NULL,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    status public.enum_contracts_status DEFAULT 'draft'::public.enum_contracts_status,
    incoterms character varying(255),
    "paymentTerms" character varying(255),
    currency character varying(255) DEFAULT 'USD'::character varying,
    "totalValue" numeric(15,2) DEFAULT 0,
    attachments json DEFAULT '[]'::json,
    notes text,
    "createdById" uuid NOT NULL,
    "updatedById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "approvalStatus" character varying(32) DEFAULT 'pending'::character varying,
    "approvalDate" timestamp without time zone,
    "approvedById" uuid,
    "supplierAcceptedAt" timestamp with time zone,
    "supplierAcceptanceNotes" text
);


ALTER TABLE public."Contracts" OWNER TO postgres;

--
-- Name: COLUMN "Contracts".status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Contracts".status IS 'Contract status: draft, active, expired, terminated';


--
-- Name: COLUMN "Contracts".incoterms; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Contracts".incoterms IS 'Delivery terms: DDP, FCA, CIP, EXW, FOB, CFR, CIF, etc.';


--
-- Name: COLUMN "Contracts"."paymentTerms"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Contracts"."paymentTerms" IS 'Payment terms: Net 30 days, Net 45 days, Prepayment, etc.';


--
-- Name: DelegationOfAuthorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DelegationOfAuthorities" (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "costCenter" character varying(255),
    "documentType" public."enum_DelegationOfAuthorities_documentType" DEFAULT 'All'::public."enum_DelegationOfAuthorities_documentType",
    "approvalLevel" integer NOT NULL,
    "amountFrom" numeric(15,2) DEFAULT 0 NOT NULL,
    "amountTo" numeric(15,2) NOT NULL,
    currency character varying(255) DEFAULT 'USD'::character varying,
    "isActive" boolean DEFAULT true,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone,
    notes text,
    "createdById" uuid NOT NULL,
    "updatedById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public."DelegationOfAuthorities" OWNER TO postgres;

--
-- Name: DelegationOfAuthorities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DelegationOfAuthorities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DelegationOfAuthorities_id_seq" OWNER TO postgres;

--
-- Name: DelegationOfAuthorities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DelegationOfAuthorities_id_seq" OWNED BY public."DelegationOfAuthorities".id;


--
-- Name: Inventories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventories" (
    id uuid NOT NULL,
    "inventoryNumber" character varying(255) NOT NULL,
    "physicalBalance" numeric(10,2) DEFAULT 0,
    "unitPrice" numeric(10,2) NOT NULL,
    "linePrice" numeric(10,2) DEFAULT 0,
    condition public."enum_Inventories_condition" DEFAULT 'A'::public."enum_Inventories_condition",
    "minimumLevel" numeric(10,2) DEFAULT 0,
    "maximumLevel" numeric(10,2) DEFAULT 0,
    warehouse character varying(255) DEFAULT ''::character varying,
    "serialNumber" character varying(255) DEFAULT ''::character varying,
    "itemMasterId" uuid NOT NULL,
    "storageLocationId" uuid,
    "lastUpdatedById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "binLocationId" uuid,
    "binLocationText" character varying(255) DEFAULT ''::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "itemId" uuid,
    "reorderPoint" numeric(10,2) DEFAULT 0
);


ALTER TABLE public."Inventories" OWNER TO postgres;

--
-- Name: ItemMasters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ItemMasters" (
    id uuid NOT NULL,
    "itemNumber" character varying(255) NOT NULL,
    "shortDescription" character varying(100) NOT NULL,
    "longDescription" text DEFAULT ''::text,
    "standardDescription" character varying(255) NOT NULL,
    "manufacturerName" character varying(255) NOT NULL,
    "manufacturerPartNumber" character varying(255) NOT NULL,
    "equipmentCategory" character varying(255) NOT NULL,
    "equipmentSubCategory" character varying(255) DEFAULT ''::character varying,
    "unspscCodeId" uuid,
    "unspscCode" character varying(8) DEFAULT ''::character varying,
    uom character varying(255) NOT NULL,
    "equipmentTag" character varying(255) DEFAULT ''::character varying,
    "serialNumber" character varying(255) DEFAULT 'N'::character varying,
    criticality public."enum_ItemMasters_criticality" DEFAULT 'NO'::public."enum_ItemMasters_criticality",
    "stockItem" public."enum_ItemMasters_stockItem" DEFAULT 'N'::public."enum_ItemMasters_stockItem",
    "plannedStock" public."enum_ItemMasters_plannedStock" DEFAULT 'N'::public."enum_ItemMasters_plannedStock",
    "stockCode" public."enum_ItemMasters_stockCode" DEFAULT 'NS3'::public."enum_ItemMasters_stockCode",
    status public."enum_ItemMasters_status" DEFAULT 'DRAFT'::public."enum_ItemMasters_status",
    "contractNumber" character varying(255) DEFAULT ''::character varying,
    "supplierName" character varying(255) DEFAULT ''::character varying,
    "createdById" uuid NOT NULL,
    "reviewedById" uuid,
    "approvedById" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "updatedById" uuid,
    "reviewedAt" timestamp with time zone
);


ALTER TABLE public."ItemMasters" OWNER TO postgres;

--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "itemId" uuid,
    "itemNumber" character varying(255),
    "shortDescription" text,
    "notificationType" character varying(50) NOT NULL,
    "actionById" uuid,
    "actionAt" timestamp with time zone DEFAULT now(),
    message text,
    "isRead" boolean DEFAULT false,
    "originalItemData" jsonb,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: PurchaseOrderItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseOrderItems" (
    id uuid NOT NULL,
    "purchaseOrderId" uuid NOT NULL,
    "rfqItemId" uuid,
    "prItemId" uuid,
    "itemNumber" character varying(255),
    description text NOT NULL,
    uom character varying(255) NOT NULL,
    quantity numeric(15,2) DEFAULT 1 NOT NULL,
    "unitPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "totalPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "deliveryDate" timestamp with time zone,
    status public."enum_PurchaseOrderItems_status" DEFAULT 'pending'::public."enum_PurchaseOrderItems_status",
    "receivedQuantity" numeric(15,2) DEFAULT 0,
    "receivedAt" timestamp with time zone,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "PurchaseOrderId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."PurchaseOrderItems" OWNER TO postgres;

--
-- Name: PurchaseOrders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseOrders" (
    id uuid NOT NULL,
    "poNumber" character varying(255) NOT NULL,
    description text NOT NULL,
    "requestForQuotationId" uuid,
    "supplierId" uuid NOT NULL,
    "contractId" uuid,
    status public."enum_PurchaseOrders_status" DEFAULT 'draft'::public."enum_PurchaseOrders_status",
    "totalAmount" numeric(15,2) DEFAULT 0,
    currency character varying(255) DEFAULT 'USD'::character varying,
    incoterms character varying(255),
    "paymentTerms" character varying(255),
    "deliveryAddress" text,
    "requestorId" uuid NOT NULL,
    "approverId" uuid NOT NULL,
    "currentApproverId" uuid,
    notes text,
    attachments json DEFAULT '[]'::json,
    "submittedAt" timestamp with time zone,
    "approvedAt" timestamp with time zone,
    "sentAt" timestamp with time zone,
    "acknowledgedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "cancelledAt" timestamp with time zone,
    "createdById" uuid NOT NULL,
    "updatedById" uuid NOT NULL,
    "costCenter" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ContractId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."PurchaseOrders" OWNER TO postgres;

--
-- Name: PurchaseRequisitionItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseRequisitionItems" (
    id uuid NOT NULL,
    "itemNumber" character varying(255),
    description text NOT NULL,
    uom character varying(255) NOT NULL,
    quantity numeric(15,2) DEFAULT 1 NOT NULL,
    "unitPrice" numeric(15,2) DEFAULT 0,
    "totalPrice" numeric(15,2) DEFAULT 0,
    "purchaseRequisitionId" uuid NOT NULL,
    "contractId" uuid,
    "supplierId" uuid,
    "supplierName" character varying(255),
    comments text,
    "deliveryDate" timestamp with time zone,
    status public."enum_PurchaseRequisitionItems_status" DEFAULT 'pending'::public."enum_PurchaseRequisitionItems_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "inventoryId" uuid,
    "itemMasterId" uuid,
    "inventoryNumber" character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "contractItemId" uuid,
    "contractPrice" numeric(10,2)
);


ALTER TABLE public."PurchaseRequisitionItems" OWNER TO postgres;

--
-- Name: PurchaseRequisitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseRequisitions" (
    id uuid NOT NULL,
    "prNumber" character varying(255) NOT NULL,
    description text NOT NULL,
    status public."enum_PurchaseRequisitions_status" DEFAULT 'draft'::public."enum_PurchaseRequisitions_status",
    "totalAmount" numeric(15,2) DEFAULT 0,
    currency character varying(255) DEFAULT 'USD'::character varying,
    "costCenter" character varying(255) NOT NULL,
    "requestorId" uuid NOT NULL,
    "approverId" uuid NOT NULL,
    "currentApproverId" uuid,
    notes text,
    attachments json DEFAULT '[]'::json,
    "submittedAt" timestamp with time zone,
    "approvedAt" timestamp with time zone,
    "rejectedAt" timestamp with time zone,
    "rejectionReason" text,
    "createdById" uuid NOT NULL,
    "updatedById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "contractId" uuid
);


ALTER TABLE public."PurchaseRequisitions" OWNER TO postgres;

--
-- Name: RejectionNotifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RejectionNotifications" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "itemNumber" character varying(255) NOT NULL,
    "shortDescription" text,
    "rejectionReason" text NOT NULL,
    "rejectedById" uuid,
    "rejectedAt" timestamp with time zone DEFAULT now(),
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now(),
    "rejectionType" character varying(50) DEFAULT 'DELETE'::character varying,
    "originalItemData" jsonb
);


ALTER TABLE public."RejectionNotifications" OWNER TO postgres;

--
-- Name: ReorderRequestItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReorderRequestItems" (
    id uuid NOT NULL,
    "currentQuantity" numeric(10,2) NOT NULL,
    "minimumLevel" numeric(10,2) NOT NULL,
    "maximumLevel" numeric(10,2) NOT NULL,
    "reorderQuantity" numeric(10,2) NOT NULL,
    "reorderRequestId" uuid NOT NULL,
    "inventoryId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ReorderRequestItems" OWNER TO postgres;

--
-- Name: ReorderRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReorderRequests" (
    id uuid NOT NULL,
    "requestNumber" character varying(255) NOT NULL,
    status public."enum_ReorderRequests_status" DEFAULT 'DRAFT'::public."enum_ReorderRequests_status",
    notes text DEFAULT ''::text,
    "purchaseRequisition" character varying(255) DEFAULT ''::character varying,
    "approvedAt" timestamp with time zone,
    "storageLocationId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "approvedById" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ReorderRequests" OWNER TO postgres;

--
-- Name: RequestForQuotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RequestForQuotations" (
    id uuid NOT NULL,
    "rfqNumber" character varying(255) NOT NULL,
    description text NOT NULL,
    status public."enum_RequestForQuotations_status" DEFAULT 'draft'::public."enum_RequestForQuotations_status",
    "responseDeadline" timestamp with time zone NOT NULL,
    notes text,
    attachments json DEFAULT '[]'::json,
    "purchaseRequisitionId" uuid,
    "createdById" uuid NOT NULL,
    "updatedById" uuid NOT NULL,
    "sentAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."RequestForQuotations" OWNER TO postgres;

--
-- Name: RfqItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RfqItems" (
    id uuid NOT NULL,
    "itemNumber" character varying(255),
    description text NOT NULL,
    uom character varying(255) NOT NULL,
    quantity numeric(15,2) DEFAULT 1 NOT NULL,
    "requestForQuotationId" uuid NOT NULL,
    "purchaseRequisitionItemId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "RequestForQuotationId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."RfqItems" OWNER TO postgres;

--
-- Name: RfqQuoteItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RfqQuoteItems" (
    id uuid NOT NULL,
    "rfqItemId" uuid,
    "rfqSupplierId" uuid NOT NULL,
    "unitPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "deliveryTime" integer,
    "deliveryDate" timestamp with time zone,
    "currencyCode" character varying(255) DEFAULT 'USD'::character varying,
    notes text,
    "isSelected" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "RfqItemId" uuid,
    "RfqSupplierId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "itemDescription" text DEFAULT ''::text NOT NULL,
    quantity numeric(15,2) DEFAULT 1.00 NOT NULL,
    "totalPrice" numeric(15,2) DEFAULT 0.00 NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    "leadTime" integer
);


ALTER TABLE public."RfqQuoteItems" OWNER TO postgres;

--
-- Name: RfqSuppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RfqSuppliers" (
    id uuid NOT NULL,
    "requestForQuotationId" uuid NOT NULL,
    "supplierId" uuid,
    "supplierName" character varying(255) NOT NULL,
    "contactName" character varying(255),
    "contactEmail" character varying(255),
    "contactEmailSecondary" character varying(255),
    "contactPhone" character varying(255),
    status public."enum_RfqSuppliers_status" DEFAULT 'pending'::public."enum_RfqSuppliers_status",
    "sentAt" timestamp with time zone,
    "respondedAt" timestamp with time zone,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "RequestForQuotationId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "responseToken" character varying(255),
    "tokenExpiry" timestamp with time zone
);


ALTER TABLE public."RfqSuppliers" OWNER TO postgres;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    "createdAt" timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: StorageLocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorageLocations" (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    street character varying(255) DEFAULT ''::character varying,
    city character varying(255) DEFAULT ''::character varying,
    "postalCode" character varying(255) DEFAULT ''::character varying,
    country character varying(255) DEFAULT ''::character varying,
    "isActive" boolean DEFAULT true,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public."StorageLocations" OWNER TO postgres;

--
-- Name: Suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Suppliers" (
    id uuid NOT NULL,
    "supplierNumber" character varying(255) NOT NULL,
    "legalName" character varying(255) NOT NULL,
    "tradeName" character varying(255),
    "contactEmail" character varying(255),
    "contactEmailSecondary" character varying(255),
    "contactPhone" character varying(255),
    "contactName" character varying(255),
    "complianceChecked" boolean DEFAULT false,
    "supplierType" public."enum_Suppliers_supplierType" DEFAULT 'transactional'::public."enum_Suppliers_supplierType",
    "paymentTerms" character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    country character varying(255),
    "postalCode" character varying(255),
    "taxId" character varying(255),
    "registrationNumber" character varying(255),
    status public."enum_Suppliers_status" DEFAULT 'pending_approval'::public."enum_Suppliers_status",
    notes text,
    "createdById" uuid NOT NULL,
    "updatedById" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "approvedById" uuid,
    "approvedAt" timestamp with time zone,
    "supplierAcceptedAt" timestamp with time zone,
    "acceptanceToken" character varying(255)
);


ALTER TABLE public."Suppliers" OWNER TO postgres;

--
-- Name: COLUMN "Suppliers"."approvedById"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Suppliers"."approvedById" IS 'User who approved the supplier';


--
-- Name: COLUMN "Suppliers"."approvedAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Suppliers"."approvedAt" IS 'Timestamp when supplier was approved';


--
-- Name: COLUMN "Suppliers"."supplierAcceptedAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Suppliers"."supplierAcceptedAt" IS 'Timestamp when supplier accepted our offer';


--
-- Name: COLUMN "Suppliers"."acceptanceToken"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Suppliers"."acceptanceToken" IS 'Unique token for supplier acceptance link';


--
-- Name: TransactionItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransactionItems" (
    id uuid NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    notes text,
    "transactionId" uuid NOT NULL,
    "inventoryId" uuid NOT NULL,
    "sourceLocationId" uuid NOT NULL,
    "sourceBinId" uuid,
    "destinationLocationId" uuid,
    "destinationBinId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."TransactionItems" OWNER TO postgres;

--
-- Name: Transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transactions" (
    id uuid NOT NULL,
    "transactionType" public."enum_Transactions_transactionType" NOT NULL,
    "transactionNumber" character varying(255) NOT NULL,
    "referenceNumber" character varying(255) DEFAULT ''::character varying,
    status public."enum_Transactions_status" DEFAULT 'DRAFT'::public."enum_Transactions_status",
    "costCenter" character varying(255) DEFAULT ''::character varying,
    "completedAt" timestamp with time zone,
    "createdById" uuid NOT NULL,
    "completedById" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Transactions" OWNER TO postgres;

--
-- Name: UnspscBreakdowns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UnspscBreakdowns" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "unspscCode" character varying(8) NOT NULL,
    "segmentCode" character varying(2) NOT NULL,
    "segmentName" character varying(255),
    "familyCode" character varying(2) NOT NULL,
    "familyName" character varying(255),
    "commodityCode" character varying(2) NOT NULL,
    "commodityName" character varying(255),
    "businessFunctionCode" character varying(2) NOT NULL,
    "businessFunctionName" character varying(255),
    "isValid" boolean DEFAULT true,
    "fullAnalysis" text,
    "formattedDisplay" character varying(20),
    "aiModel" character varying(50),
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."UnspscBreakdowns" OWNER TO postgres;

--
-- Name: UnspscCodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UnspscCodes" (
    id uuid NOT NULL,
    code character varying(8) NOT NULL,
    segment character varying(2) NOT NULL,
    family character varying(2) NOT NULL,
    class character varying(2) NOT NULL,
    commodity character varying(2) NOT NULL,
    title character varying(255) NOT NULL,
    definition text,
    level public."enum_UnspscCodes_level" NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UnspscCodes" OWNER TO postgres;

--
-- Name: UserUnspscFavorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserUnspscFavorites" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "unspscCode" character varying(8) NOT NULL,
    title character varying(255),
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserUnspscFavorites" OWNER TO postgres;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public."enum_Users_role" DEFAULT 'staff'::public."enum_Users_role",
    "createItemMaster" boolean DEFAULT false,
    "editItemMaster" boolean DEFAULT false,
    "approveItemMaster" boolean DEFAULT false,
    "setInventoryLevels" boolean DEFAULT false,
    "createReorderRequests" boolean DEFAULT false,
    "approveReorderRequests" boolean DEFAULT false,
    "warehouseTransactions" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isActive" boolean DEFAULT true
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Warehouses" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Warehouses" OWNER TO postgres;

--
-- Name: Warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Warehouses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Warehouses_id_seq" OWNER TO postgres;

--
-- Name: Warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Warehouses_id_seq" OWNED BY public."Warehouses".id;


--
-- Name: bin_locations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.bin_locations AS
 SELECT id,
    "binCode",
    description,
    "isActive",
    "storageLocationId",
    "createdById",
    "createdAt",
    "updatedAt",
    created_at,
    updated_at,
    is_active
   FROM public."BinLocations";


ALTER VIEW public.bin_locations OWNER TO postgres;

--
-- Name: storage_locations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.storage_locations AS
 SELECT id,
    code,
    description,
    street,
    city,
    "postalCode",
    country,
    "isActive",
    "createdById",
    "createdAt",
    "updatedAt",
    created_at,
    updated_at,
    is_active
   FROM public."StorageLocations";


ALTER VIEW public.storage_locations OWNER TO postgres;

--
-- Name: unspsc_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unspsc_codes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(8) NOT NULL,
    segment character varying(2) NOT NULL,
    family character varying(2) NOT NULL,
    class character varying(2) NOT NULL,
    commodity character varying(2) NOT NULL,
    title character varying(255) NOT NULL,
    definition text,
    level character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unspsc_codes_level_check CHECK (((level)::text = ANY ((ARRAY['SEGMENT'::character varying, 'FAMILY'::character varying, 'CLASS'::character varying, 'COMMODITY'::character varying])::text[])))
);


ALTER TABLE public.unspsc_codes OWNER TO postgres;

--
-- Name: user_unspsc_favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_unspsc_favorites (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "unspscCode" character varying(255) NOT NULL,
    level public.enum_user_unspsc_favorites_level NOT NULL,
    title character varying(255) NOT NULL,
    segment character varying(255),
    family character varying(255),
    class character varying(255),
    commodity character varying(255),
    "isDefault" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "segmentTitle" character varying(255),
    "familyTitle" character varying(255),
    "classTitle" character varying(255),
    "commodityTitle" character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_unspsc_favorites OWNER TO postgres;

--
-- Name: user_unspsc_hierarchy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_unspsc_hierarchy (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "unspscCode" character varying(255) NOT NULL,
    level public.enum_user_unspsc_hierarchy_level NOT NULL,
    title character varying(255) NOT NULL,
    segment character varying(255),
    "segmentTitle" character varying(255),
    family character varying(255),
    "familyTitle" character varying(255),
    class character varying(255),
    "classTitle" character varying(255),
    commodity character varying(255),
    "commodityTitle" character varying(255),
    "useFrequency" integer DEFAULT 1,
    "lastUsed" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_unspsc_hierarchy OWNER TO postgres;

--
-- Name: ApprovalHistories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ApprovalHistories" ALTER COLUMN id SET DEFAULT nextval('public."ApprovalHistories_id_seq"'::regclass);


--
-- Name: DelegationOfAuthorities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DelegationOfAuthorities" ALTER COLUMN id SET DEFAULT nextval('public."DelegationOfAuthorities_id_seq"'::regclass);


--
-- Name: Warehouses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Warehouses" ALTER COLUMN id SET DEFAULT nextval('public."Warehouses_id_seq"'::regclass);


--
-- Data for Name: ApprovalHistories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ApprovalHistories" (id, "referenceId", "referenceType", "approverId", level, status, comments, "actionDate", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
1	00592cd9-64d0-4a22-9e01-98e7aa6c249f	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	approved	Auto-approved by admin	2025-06-18 19:18:20.717+04	2025-06-18 19:18:20.718+04	2025-06-18 19:18:20.718+04	2025-06-18 19:18:20.416311+04	2025-06-18 19:18:20.416311+04
2	bde34d22-7cdd-4b25-9996-c4a72b7f6276	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-18 20:30:27.106+04	2025-06-18 20:30:27.106+04	2025-06-18 20:30:26.623727+04	2025-06-18 20:30:26.623727+04
3	56a512e5-e39f-4328-aca5-6e749a7c3f64	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-23 19:10:58.385+04	2025-06-23 19:10:58.385+04	2025-06-23 19:10:58.371204+04	2025-06-23 19:10:58.371204+04
4	030cb807-6c61-4f23-a5e5-47216d7ba997	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 02:26:04.765+04	2025-06-24 02:26:04.765+04	2025-06-24 02:26:04.733502+04	2025-06-24 02:26:04.733502+04
5	67185b8e-271f-46dd-ad2d-aab6082f26b7	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 02:26:42.448+04	2025-06-24 02:26:42.448+04	2025-06-24 02:26:42.414913+04	2025-06-24 02:26:42.414913+04
6	21aedf42-4df3-4cbf-bfb1-e80b66c39f3d	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 02:28:36.392+04	2025-06-24 02:28:36.392+04	2025-06-24 02:28:36.374888+04	2025-06-24 02:28:36.374888+04
7	4a0ad90c-329f-4f65-855e-abc194033f47	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 02:57:47.776+04	2025-06-24 02:57:47.776+04	2025-06-24 02:57:47.465285+04	2025-06-24 02:57:47.465285+04
8	d0b0ffe9-7807-4965-94c3-5a202502b586	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 13:06:57.395+04	2025-06-24 13:06:57.395+04	2025-06-24 13:06:57.163055+04	2025-06-24 13:06:57.163055+04
9	a97da0f6-c3e5-4f89-90f9-1f535dcc117c	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 13:11:58.11+04	2025-06-24 13:11:58.11+04	2025-06-24 13:11:58.096768+04	2025-06-24 13:11:58.096768+04
10	fcf111c2-c11a-4f74-a1c0-b021e36d6c78	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 13:12:01.27+04	2025-06-24 13:12:01.27+04	2025-06-24 13:12:01.261857+04	2025-06-24 13:12:01.261857+04
11	e91aa542-08a8-4992-9c23-41ee7de150b5	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-24 13:12:03.958+04	2025-06-24 13:12:03.958+04	2025-06-24 13:12:03.941432+04	2025-06-24 13:12:03.941432+04
12	59429007-94ea-4903-93ed-ab512c7d4775	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	rejected	Rejected	2025-06-25 01:20:21.767+04	2025-06-25 01:20:21.768+04	2025-06-25 01:20:21.768+04	2025-06-25 01:20:21.52092+04	2025-06-25 01:20:21.52092+04
18	1d353659-0e39-48da-ab77-80fa49b22663	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	rejected	gggggggggggggg	2025-06-25 01:43:14.569+04	2025-06-25 01:43:14.571+04	2025-06-25 01:43:14.571+04	2025-06-25 01:43:14.532026+04	2025-06-25 01:43:14.532026+04
37	53f5778b-6856-4868-9752-0b4cb68c93bc	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	rejected	vbbbbbbbbbbbbb	2025-06-25 02:37:22.434+04	2025-06-25 02:37:22.436+04	2025-06-25 02:37:22.436+04	2025-06-25 02:37:22.394412+04	2025-06-25 02:37:22.394412+04
38	ee589dbd-40d5-4e39-b2e6-59de0635569a	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	rejected	DDDDDDDDDDDDDDDDDDDDDDDDDDDDD	2025-06-25 02:38:27.506+04	2025-06-25 02:38:27.507+04	2025-06-25 02:38:27.507+04	2025-06-25 02:38:27.501108+04	2025-06-25 02:38:27.501108+04
39	ee589dbd-40d5-4e39-b2e6-59de0635569a	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	pending	Submitted for approval by System Administrator	\N	2025-06-25 02:42:14.776+04	2025-06-25 02:42:14.776+04	2025-06-25 02:42:14.766009+04	2025-06-25 02:42:14.766009+04
40	ee589dbd-40d5-4e39-b2e6-59de0635569a	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	approved	dssssss	2025-06-25 02:42:22.992+04	2025-06-25 02:42:22.992+04	2025-06-25 02:42:22.992+04	2025-06-25 02:42:22.984365+04	2025-06-25 02:42:22.984365+04
41	ec9545fe-487f-4f4a-b86d-225b6fd9b125	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	approved	fdddddd	2025-06-25 02:48:33.689+04	2025-06-25 02:48:33.689+04	2025-06-25 02:48:33.689+04	2025-06-25 02:48:33.683779+04	2025-06-25 02:48:33.683779+04
42	0caf623f-31f2-4d6b-9ec9-78691bb0427c	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	approved	Approved via Review Dashboard	2025-06-25 02:57:10.51+04	2025-06-25 02:57:10.51+04	2025-06-25 02:57:10.51+04	2025-06-25 02:57:10.501457+04	2025-06-25 02:57:10.501457+04
43	e2c8c258-0b93-4523-a626-89446536438e	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	approved	Approved via Review Dashboard	2025-06-25 03:03:50.135+04	2025-06-25 03:03:50.135+04	2025-06-25 03:03:50.135+04	2025-06-25 03:03:50.129039+04	2025-06-25 03:03:50.129039+04
44	2bf7f423-b236-49e2-9d73-690d10b64798	PurchaseRequisition	0b4afa3e-8582-452b-833c-f8bf695c4d60	1	approved	Approved	2025-06-25 03:08:08.534+04	2025-06-25 03:08:08.547+04	2025-06-25 03:08:08.547+04	2025-06-25 03:08:08.525832+04	2025-06-25 03:08:08.525832+04
\.


--
-- Data for Name: BinLocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BinLocations" (id, "binCode", description, "isActive", "storageLocationId", "createdById", "createdAt", "updatedAt", created_at, updated_at, is_active) FROM stdin;
d9576281-9398-45a5-b2d0-2cc419e6fcfe	W1020304	Bin W1020304	t	7d9e6df0-2940-42e5-b37c-c3139a51b1e0	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 15:28:08.762+04	2025-06-23 15:28:08.762+04	2025-06-23 15:28:08.767358+04	2025-06-23 15:28:08.767358+04	t
7b036ce1-cd11-4312-b580-dfd68898fc62	W5050607	Bin W5050607	t	9002288d-13b9-44a8-be42-8077f76ee0aa	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 15:57:27.627+04	2025-06-23 18:00:14.509+04	2025-06-23 15:57:27.628697+04	2025-06-23 15:57:27.628697+04	t
\.


--
-- Data for Name: ContractItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContractItems" (id, "contractId", "itemNumber", description, uom, "unitPrice", "leadTime", "minimumOrderQuantity", notes, "createdAt", "updatedAt", "ContractId", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Contracts" (id, "contractNumber", "contractName", description, "supplierId", "startDate", "endDate", status, incoterms, "paymentTerms", currency, "totalValue", attachments, notes, "createdById", "updatedById", "createdAt", "updatedAt", created_at, updated_at, "approvalStatus", "approvalDate", "approvedById", "supplierAcceptedAt", "supplierAcceptanceNotes") FROM stdin;
de6463a7-1a9e-4c54-ab2c-2ef6300a8c10	CTR-2025-357273	dfdfddffgfgf	dffdfd	b12610ef-9aa6-4a42-956d-464f51a5c262	2025-06-25 04:00:00+04	2025-07-25 04:00:00+04	active	DDP	30 days	USD	2500.00	[]	fdfddffd\n\nApproval Notes: fdfd\n\nSupplier Acceptance: bbb	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-26 02:53:46.489+04	2025-06-26 02:56:52.035719+04	2025-06-26 02:53:46.500615+04	2025-06-26 02:53:46.500615+04	approved	2025-06-25 22:53:53.419	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-26 02:56:52.04+04	bbb
\.


--
-- Data for Name: DelegationOfAuthorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DelegationOfAuthorities" (id, "userId", "costCenter", "documentType", "approvalLevel", "amountFrom", "amountTo", currency, "isActive", "startDate", "endDate", notes, "createdById", "updatedById", "createdAt", "updatedAt", created_at, updated_at, is_active) FROM stdin;
\.


--
-- Data for Name: Inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inventories" (id, "inventoryNumber", "physicalBalance", "unitPrice", "linePrice", condition, "minimumLevel", "maximumLevel", warehouse, "serialNumber", "itemMasterId", "storageLocationId", "lastUpdatedById", "createdAt", "updatedAt", "binLocationId", "binLocationText", created_at, updated_at, "itemId", "reorderPoint") FROM stdin;
745673be-dde4-4cf4-8306-a0307b92981f	INV-ELECTRICAL-KEYBOARD-20250623-722-1750691538273	0.00	10.00	0.00	N	5.00	100.00			4889d233-3db0-4891-9a91-5ac594efd0b6	7d9e6df0-2940-42e5-b37c-c3139a51b1e0	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 19:12:18.275+04	2025-06-23 19:12:18.275+04	d9576281-9398-45a5-b2d0-2cc419e6fcfe		2025-06-23 19:12:18.277841+04	2025-06-23 19:12:18.277841+04	4889d233-3db0-4891-9a91-5ac594efd0b6	0.00
\.


--
-- Data for Name: ItemMasters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ItemMasters" (id, "itemNumber", "shortDescription", "longDescription", "standardDescription", "manufacturerName", "manufacturerPartNumber", "equipmentCategory", "equipmentSubCategory", "unspscCodeId", "unspscCode", uom, "equipmentTag", "serialNumber", criticality, "stockItem", "plannedStock", "stockCode", status, "contractNumber", "supplierName", "createdById", "reviewedById", "approvedById", "createdAt", "updatedAt", "updatedById", "reviewedAt") FROM stdin;
4d6fd3e1-dcac-4aed-97d0-622f0a990d57	VALVE-GATE-20250621-728	VALVE, GATE: 6IN, CLASS 300, STAINLESS STEEL		VALVE, GATE: 6IN, CLASS 300, STAINLESS STEEL	GALPERTY	GV111222	VALVE	GATE	\N	40141607	EA	VLV-001		HIGH	Y	Y	NS3	APPROVED	CNT-12345	GALPERTY SUPPLIER	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	2025-06-21 14:04:19.363163+04	2025-06-21 14:06:31.988057+04	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-21 14:06:31.988057+04
2e590ae2-b824-4521-b104-572b2d0edb42	OTHER-LINEN-20250624-791	Towel, Cotton, White, 16x27in, Medium Weight	Medium weight white cotton towels suitable for general facility use, including cleaning, wiping, and personal hygiene in industrial, commercial, and institutional environments. Durable and absorbent for repeated laundering.	TOWEL, COTTON: WHITE, 16X27IN, MEDIUM WEIGHT	Georgia-Pacific	GP-1627MW-WHT	OTHER	LINEN	\N	53131624	EA			NO	Y	Y	NS3	APPROVED			0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	2025-06-24 22:33:19.807073+04	2025-06-24 22:33:44.370288+04	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-24 22:33:44.370288+04
b3339ccf-d029-4426-ad8f-1ee1f47e7386	ELECTRICAL-POWER ADAPTER-20250623-082	Power Adapter, USB Charging, 5V 2A	Universal USB charging power adapter for electronic devices. Converts AC mains power to regulated 5V DC output, suitable for charging smartphones, tablets, and small electronics in office or industrial environments.	ADAPTER, POWER: USB, 5V DC, 2A, AC INPUT 100-240V	Anker	A2021	ELECTRICAL	POWER ADAPTER	\N	39121006	EA			NO	Y	Y	NS3	APPROVED			0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	2025-06-23 14:43:51.864721+04	2025-06-23 14:44:03.980158+04	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 14:44:03.980158+04
4889d233-3db0-4891-9a91-5ac594efd0b6	ELECTRICAL-KEYBOARD-20250623-722	Keyboard, Mechanical USB Black	Mechanical keyboard with tactile switches, USB interface, and standard 104-key layout. Designed for office, industrial, or IT environments requiring reliable, high-durability input devices. Suitable for frequent typing and extended use.	KEYBOARD, MECHANICAL: USB, 104 KEY, BLACK	Jedel	JK-850U	ELECTRICAL	KEYBOARD	\N	43211706	EA			NO	N	Y	NS3	APPROVED			0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	2025-06-23 14:59:34.917394+04	2025-06-23 14:59:44.225583+04	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 14:59:44.225583+04
fab008c4-1001-4047-9e93-2dd05c587f93	ELECTRICAL-SMARTPHONE-20250621-357	Smartphone, iPhone X 64GB Silver	Apple iPhone X smartphone with 64GB storage in silver finish. Designed for business and personal communication, mobile computing, and secure data access. Suitable for enterprise mobility, field operations, and executive use.	SMARTPHONE, APPLE: IPHONE X, 64GB, SILVER	Apple Inc.	MQAC2LL/A	ELECTRICAL	SMARTPHONE	\N	43191501	EA			LOW	N	N	NS3	APPROVED			0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	2025-06-21 02:23:50.211617+04	2025-06-21 03:28:11.922319+04	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-21 03:28:11.922319+04
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notifications" (id, "itemId", "itemNumber", "shortDescription", "notificationType", "actionById", "actionAt", message, "isRead", "originalItemData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PurchaseOrderItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseOrderItems" (id, "purchaseOrderId", "rfqItemId", "prItemId", "itemNumber", description, uom, quantity, "unitPrice", "totalPrice", "deliveryDate", status, "receivedQuantity", "receivedAt", notes, "createdAt", "updatedAt", "PurchaseOrderId", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: PurchaseOrders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseOrders" (id, "poNumber", description, "requestForQuotationId", "supplierId", "contractId", status, "totalAmount", currency, incoterms, "paymentTerms", "deliveryAddress", "requestorId", "approverId", "currentApproverId", notes, attachments, "submittedAt", "approvedAt", "sentAt", "acknowledgedAt", "completedAt", "cancelledAt", "createdById", "updatedById", "costCenter", "createdAt", "updatedAt", "ContractId", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: PurchaseRequisitionItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseRequisitionItems" (id, "itemNumber", description, uom, quantity, "unitPrice", "totalPrice", "purchaseRequisitionId", "contractId", "supplierId", "supplierName", comments, "deliveryDate", status, "createdAt", "updatedAt", "inventoryId", "itemMasterId", "inventoryNumber", created_at, updated_at, "contractItemId", "contractPrice") FROM stdin;
d538e7aa-13cd-4771-99dd-045282dc29b7	\N	Mechanical keyboard with tactile switches, USB interface, and standard 104-key layout. Designed for office, industrial, or IT environments requiring reliable, high-durability input devices. Suitable for frequent typing and extended use.	EA	10.00	20.00	200.00	ee589dbd-40d5-4e39-b2e6-59de0635569a	\N	\N	\N	\N	\N	pending	2025-06-25 02:38:15.299+04	2025-06-25 02:38:15.299+04	\N	\N	\N	2025-06-25 02:38:15.05086+04	2025-06-25 02:38:15.05086+04	\N	\N
0d23b028-09b9-430b-a6a1-8b01ba4934b3	\N	Medium weight white cotton towels suitable for general facility use, including cleaning, wiping, and personal hygiene in industrial, commercial, and institutional environments. Durable and absorbent for repeated laundering.	EA	1.00	0.00	0.00	ec9545fe-487f-4f4a-b86d-225b6fd9b125	\N	\N	\N	\N	\N	pending	2025-06-25 02:48:21.582+04	2025-06-25 02:48:21.582+04	\N	\N	\N	2025-06-25 02:48:21.550604+04	2025-06-25 02:48:21.550604+04	\N	\N
653953c8-518d-4393-81a7-dfd6e3c24f8f	\N	Medium weight white cotton towels suitable for general facility use, including cleaning, wiping, and personal hygiene in industrial, commercial, and institutional environments. Durable and absorbent for repeated laundering.	EA	1.00	0.00	0.00	0caf623f-31f2-4d6b-9ec9-78691bb0427c	\N	\N	\N	\N	\N	pending	2025-06-25 02:56:57.716+04	2025-06-25 02:56:57.716+04	\N	\N	\N	2025-06-25 02:56:57.452837+04	2025-06-25 02:56:57.452837+04	\N	\N
eb19b839-2071-4ebe-8699-f8dc27fcd96c	\N	Mechanical keyboard with tactile switches, USB interface, and standard 104-key layout. Designed for office, industrial, or IT environments requiring reliable, high-durability input devices. Suitable for frequent typing and extended use.	EA	1.00	0.00	0.00	e2c8c258-0b93-4523-a626-89446536438e	\N	\N	\N	\N	\N	pending	2025-06-25 03:03:41.461+04	2025-06-25 03:03:41.461+04	\N	\N	\N	2025-06-25 03:03:41.404118+04	2025-06-25 03:03:41.404118+04	\N	\N
9aa19ff5-387b-426d-bd4a-09ffb8905efd	\N	Mechanical keyboard with tactile switches, USB interface, and standard 104-key layout. Designed for office, industrial, or IT environments requiring reliable, high-durability input devices. Suitable for frequent typing and extended use.	EA	1.00	1.00	1.00	2bf7f423-b236-49e2-9d73-690d10b64798	\N	\N	\N	\N	\N	pending	2025-06-25 03:07:56.746+04	2025-06-25 03:07:56.746+04	\N	\N	\N	2025-06-25 03:07:56.473513+04	2025-06-25 03:07:56.473513+04	\N	\N
ca774ab2-7646-4678-9d33-69b72e4ba4e2	\N	Medium weight white cotton towels suitable for general facility use, including cleaning, wiping, and personal hygiene in industrial, commercial, and institutional environments. Durable and absorbent for repeated laundering.	EA	1.00	0.00	0.00	8ee26be1-6bf4-4dba-86bd-4aaa8ccde4da	\N	\N	\N	\N	\N	pending	2025-06-25 03:48:19.362+04	2025-06-25 03:48:19.362+04	\N	\N	\N	2025-06-25 03:48:19.075781+04	2025-06-25 03:48:19.075781+04	\N	\N
\.


--
-- Data for Name: PurchaseRequisitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseRequisitions" (id, "prNumber", description, status, "totalAmount", currency, "costCenter", "requestorId", "approverId", "currentApproverId", notes, attachments, "submittedAt", "approvedAt", "rejectedAt", "rejectionReason", "createdById", "updatedById", "createdAt", "updatedAt", created_at, updated_at, "contractId") FROM stdin;
e2c8c258-0b93-4523-a626-89446536438e	PR-20250625-2687	Purchase Requisition	approved	0.00	USD	General	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	[]	2025-06-25 03:03:41.406+04	2025-06-25 03:03:50.143+04	\N	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 03:03:41.407+04	2025-06-25 03:03:50.143+04	2025-06-25 03:03:41.404118+04	2025-06-25 03:03:41.404118+04	\N
2bf7f423-b236-49e2-9d73-690d10b64798	PR-20250625-6025	Purchase Requisition	approved	1.00	USD	General	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	[]	2025-06-25 03:07:56.475+04	2025-06-25 03:08:08.559+04	\N	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 03:07:56.477+04	2025-06-25 03:08:08.56+04	2025-06-25 03:07:56.473513+04	2025-06-25 03:07:56.473513+04	\N
8ee26be1-6bf4-4dba-86bd-4aaa8ccde4da	PR-20250625-9737	Purchase Requisition	submitted	0.00	USD	General	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	[]	2025-06-26 15:43:13.034+04	\N	\N	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 03:48:19.078+04	2025-06-26 15:43:13.036+04	2025-06-25 03:48:19.075781+04	2025-06-25 03:48:19.075781+04	\N
ee589dbd-40d5-4e39-b2e6-59de0635569a	PR-20250625-9787	Purchase Requisition	approved	200.00	USD	General	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	[]	2025-06-25 02:42:14.772+04	2025-06-25 02:42:22.997+04	2025-06-25 02:38:27.514+04	DDDDDDDDDDDDDDDDDDDDDDDDDDDDD	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 02:38:15.054+04	2025-06-25 02:42:22.998+04	2025-06-25 02:38:15.05086+04	2025-06-25 02:38:15.05086+04	\N
ec9545fe-487f-4f4a-b86d-225b6fd9b125	PR-20250625-9950	Purchase Requisition	approved	0.00	USD	General	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	[]	2025-06-25 02:48:21.552+04	2025-06-25 02:48:33.697+04	\N	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 02:48:21.555+04	2025-06-25 02:48:33.698+04	2025-06-25 02:48:21.550604+04	2025-06-25 02:48:21.550604+04	\N
0caf623f-31f2-4d6b-9ec9-78691bb0427c	PR-20250625-3461	Purchase Requisition	approved	0.00	USD	General	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	[]	2025-06-25 02:56:57.454+04	2025-06-25 02:57:10.525+04	\N	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 02:56:57.456+04	2025-06-25 02:57:10.526+04	2025-06-25 02:56:57.452837+04	2025-06-25 02:56:57.452837+04	\N
\.


--
-- Data for Name: RejectionNotifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RejectionNotifications" (id, "itemNumber", "shortDescription", "rejectionReason", "rejectedById", "rejectedAt", "isRead", "createdAt", "updatedAt", "rejectionType", "originalItemData") FROM stdin;
9f945f1e-7c24-4282-97e0-47c7247f6724	PR-20250625-9091	Purchase Requisition	gggggggggggggg	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-25 01:43:14.593+04	f	2025-06-25 01:43:14.532026+04	2025-06-25 01:43:14.532026+04	DELETE	\N
\.


--
-- Data for Name: ReorderRequestItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReorderRequestItems" (id, "currentQuantity", "minimumLevel", "maximumLevel", "reorderQuantity", "reorderRequestId", "inventoryId", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ReorderRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReorderRequests" (id, "requestNumber", status, notes, "purchaseRequisition", "approvedAt", "storageLocationId", "createdById", "approvedById", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: RequestForQuotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RequestForQuotations" (id, "rfqNumber", description, status, "responseDeadline", notes, attachments, "purchaseRequisitionId", "createdById", "updatedById", "sentAt", "completedAt", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
842f7900-92ef-49a6-ba03-3f26b97015fd	RFQ-20250626-0001	Test RFQ for office supplies	draft	2025-07-03 16:44:05.892+04	This is a test RFQ created for debugging purposes	[]	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	2025-06-26 16:44:06.146+04	2025-06-26 16:44:06.146+04	2025-06-26 16:44:05.962534+04	2025-06-26 16:44:05.962534+04
2083c6ed-8607-4a6b-9dc3-b760aee51847	RFQ-20250626-0002	Test RFQ for office supplies	draft	2025-07-03 16:46:54.426+04	This is a test RFQ created for debugging purposes	[]	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	2025-06-26 16:46:54.917+04	2025-06-26 16:46:54.917+04	2025-06-26 16:46:54.842722+04	2025-06-26 16:46:54.842722+04
97b9193a-72be-4cbb-856a-7b8f5cc9b5aa	RFQ-20250626-0003	Test RFQ for office supplies	draft	2025-07-03 16:50:57.672+04	This is a test RFQ created for debugging purposes	[]	\N	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	\N	\N	2025-06-26 16:50:58.337+04	2025-06-26 16:50:58.337+04	2025-06-26 16:50:58.150603+04	2025-06-26 16:50:58.150603+04
\.


--
-- Data for Name: RfqItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RfqItems" (id, "itemNumber", description, uom, quantity, "requestForQuotationId", "purchaseRequisitionItemId", "createdAt", "updatedAt", "RequestForQuotationId", created_at, updated_at) FROM stdin;
73faf235-6a60-4140-b3ca-0cf1eb00e34b	\N	Office chairs	pieces	10.00	842f7900-92ef-49a6-ba03-3f26b97015fd	\N	2025-06-26 16:44:06.193+04	2025-06-26 16:44:06.193+04	\N	2025-06-26 16:44:05.962534+04	2025-06-26 16:44:05.962534+04
51b4a054-7c45-46f9-a6e4-c455037f023a	\N	Desk lamps	pieces	5.00	842f7900-92ef-49a6-ba03-3f26b97015fd	\N	2025-06-26 16:44:06.198+04	2025-06-26 16:44:06.198+04	\N	2025-06-26 16:44:05.962534+04	2025-06-26 16:44:05.962534+04
ea19402a-a318-40f6-b572-f860cb23bf55	\N	Office chairs	pieces	10.00	2083c6ed-8607-4a6b-9dc3-b760aee51847	\N	2025-06-26 16:46:55.203+04	2025-06-26 16:46:55.203+04	\N	2025-06-26 16:46:54.842722+04	2025-06-26 16:46:54.842722+04
fb22a078-5aa9-40ee-8913-e5e38cf8f284	\N	Desk lamps	pieces	5.00	2083c6ed-8607-4a6b-9dc3-b760aee51847	\N	2025-06-26 16:46:55.223+04	2025-06-26 16:46:55.223+04	\N	2025-06-26 16:46:54.842722+04	2025-06-26 16:46:54.842722+04
52412844-33bd-4f94-809a-c30cb0c482a7	\N	Office chairs	pieces	10.00	97b9193a-72be-4cbb-856a-7b8f5cc9b5aa	\N	2025-06-26 16:50:58.626+04	2025-06-26 16:50:58.626+04	\N	2025-06-26 16:50:58.150603+04	2025-06-26 16:50:58.150603+04
e7e29f1c-ceec-434a-ba21-e27a1ab475f0	\N	Desk lamps	pieces	5.00	97b9193a-72be-4cbb-856a-7b8f5cc9b5aa	\N	2025-06-26 16:50:58.648+04	2025-06-26 16:50:58.648+04	\N	2025-06-26 16:50:58.150603+04	2025-06-26 16:50:58.150603+04
\.


--
-- Data for Name: RfqQuoteItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RfqQuoteItems" (id, "rfqItemId", "rfqSupplierId", "unitPrice", "deliveryTime", "deliveryDate", "currencyCode", notes, "isSelected", "createdAt", "updatedAt", "RfqItemId", "RfqSupplierId", created_at, updated_at, "itemDescription", quantity, "totalPrice", currency, "leadTime") FROM stdin;
\.


--
-- Data for Name: RfqSuppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RfqSuppliers" (id, "requestForQuotationId", "supplierId", "supplierName", "contactName", "contactEmail", "contactEmailSecondary", "contactPhone", status, "sentAt", "respondedAt", notes, "createdAt", "updatedAt", "RequestForQuotationId", created_at, updated_at, "responseToken", "tokenExpiry") FROM stdin;
b92db507-56ca-4dc9-99a5-e021decec82c	842f7900-92ef-49a6-ba03-3f26b97015fd	\N	Test Supplier 1	John Doe	supplier1@test.com	\N	\N	pending	\N	\N	\N	2025-06-26 16:44:06.201+04	2025-06-26 16:44:06.201+04	\N	2025-06-26 16:44:05.962534+04	2025-06-26 16:44:05.962534+04	\N	\N
032aac4e-68b1-416e-960b-9d36b2dea4b9	842f7900-92ef-49a6-ba03-3f26b97015fd	\N	Test Supplier 2	Jane Smith	supplier2@test.com	\N	\N	pending	\N	\N	\N	2025-06-26 16:44:06.207+04	2025-06-26 16:44:06.207+04	\N	2025-06-26 16:44:05.962534+04	2025-06-26 16:44:05.962534+04	\N	\N
1a960a3e-b8bb-4047-b7c2-fb75084b9856	2083c6ed-8607-4a6b-9dc3-b760aee51847	\N	Test Supplier 1	John Doe	supplier1@test.com	\N	\N	pending	\N	\N	\N	2025-06-26 16:46:55.225+04	2025-06-26 16:46:55.225+04	\N	2025-06-26 16:46:54.842722+04	2025-06-26 16:46:54.842722+04	\N	\N
146ae6d9-b938-4ac4-bf70-1e0442adeae7	2083c6ed-8607-4a6b-9dc3-b760aee51847	\N	Test Supplier 2	Jane Smith	supplier2@test.com	\N	\N	pending	\N	\N	\N	2025-06-26 16:46:55.228+04	2025-06-26 16:46:55.228+04	\N	2025-06-26 16:46:54.842722+04	2025-06-26 16:46:54.842722+04	\N	\N
930fce0d-5bf5-41d9-9a87-6d7bcadbefb8	97b9193a-72be-4cbb-856a-7b8f5cc9b5aa	\N	Test Supplier 1	John Doe	supplier1@test.com	\N	\N	pending	\N	\N	\N	2025-06-26 16:50:58.651+04	2025-06-26 16:50:58.651+04	\N	2025-06-26 16:50:58.150603+04	2025-06-26 16:50:58.150603+04	\N	\N
7c8272e4-6419-43a8-8202-e8a203f621cf	97b9193a-72be-4cbb-856a-7b8f5cc9b5aa	\N	Test Supplier 2	Jane Smith	supplier2@test.com	\N	\N	pending	\N	\N	\N	2025-06-26 16:50:58.656+04	2025-06-26 16:50:58.656+04	\N	2025-06-26 16:50:58.150603+04	2025-06-26 16:50:58.150603+04	\N	\N
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name, created_at, "createdAt", updated_at, "updatedAt") FROM stdin;
20250613000000-create-users.js	2025-06-14 02:15:07.189349+04	2025-06-14 02:15:07.189349+04	2025-06-14 02:15:07.19081+04	2025-06-14 02:15:07.19081+04
\.


--
-- Data for Name: StorageLocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorageLocations" (id, code, description, street, city, "postalCode", country, "isActive", "createdById", "createdAt", "updatedAt", created_at, updated_at, is_active) FROM stdin;
7d9e6df0-2940-42e5-b37c-c3139a51b1e0	BAK01	Baku Storage Location, 1001, Memedeli Sherifli 25a			1001	Azerbaijan	t	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 15:27:04.328+04	2025-06-23 15:27:04.328+04	2025-06-23 15:27:04.328972+04	2025-06-23 15:27:04.328972+04	t
9002288d-13b9-44a8-be42-8077f76ee0aa	BRG01	Baku Storage Location, 1001, Memedeli Sherifli 25a			1001	Azerbaijan	t	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-23 15:56:12.483+04	2025-06-23 15:56:12.483+04	2025-06-23 15:56:12.487489+04	2025-06-23 15:56:12.487489+04	t
\.


--
-- Data for Name: Suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Suppliers" (id, "supplierNumber", "legalName", "tradeName", "contactEmail", "contactEmailSecondary", "contactPhone", "contactName", "complianceChecked", "supplierType", "paymentTerms", address, city, state, country, "postalCode", "taxId", "registrationNumber", status, notes, "createdById", "updatedById", "createdAt", "updatedAt", created_at, updated_at, "approvedById", "approvedAt", "supplierAcceptedAt", "acceptanceToken") FROM stdin;
b12610ef-9aa6-4a42-956d-464f51a5c262	SUP-20250614-0002	Global Industrial Supply Ltd.	GIS	yousoubof@gmail.com	\N	+1-555-987-6543	Sarah Johnson	t	transactional	Net 45	789 Industrial Blvd	Chicago	IL	USA	60607	98-7654321	REG789012	active	Global supplier for industrial equipment	0b4afa3e-8582-452b-833c-f8bf695c4d60	0b4afa3e-8582-452b-833c-f8bf695c4d60	2025-06-14 23:59:49.619+04	2025-06-14 23:59:49.619+04	2025-06-14 23:59:49.619+04	2025-06-14 23:59:49.619+04	\N	\N	\N	\N
\.


--
-- Data for Name: TransactionItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransactionItems" (id, quantity, "unitPrice", notes, "transactionId", "inventoryId", "sourceLocationId", "sourceBinId", "destinationLocationId", "destinationBinId", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transactions" (id, "transactionType", "transactionNumber", "referenceNumber", status, "costCenter", "completedAt", "createdById", "completedById", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: UnspscBreakdowns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UnspscBreakdowns" (id, "unspscCode", "segmentCode", "segmentName", "familyCode", "familyName", "commodityCode", "commodityName", "businessFunctionCode", "businessFunctionName", "isValid", "fullAnalysis", "formattedDisplay", "aiModel", "createdAt", "updatedAt") FROM stdin;
6887fbc0-3e62-4c33-acf3-e7daca5db5b0	40000000	40	Distribution and Conditional Services	00	Distribution and Conditional Services	00	Distribution and Conditional Services	00	Distribution and Conditional Services	t	This segment covers distribution and conditional services including logistics, warehousing, and related services.	40-00-00-00	system-default	2025-06-21 03:07:44.710543+04	2025-06-21 03:07:44.710543+04
d8b9c023-a5dc-4231-be3a-12a667f2a5be	31000000	31	Manufacturing Components and Supplies	00	Manufacturing Components and Supplies	00	Manufacturing Components and Supplies	00	Manufacturing Components and Supplies	t	This segment covers manufacturing components and supplies including industrial equipment, tools, and materials.	31-00-00-00	system-default	2025-06-21 03:07:44.710543+04	2025-06-21 03:07:44.710543+04
34bbd394-1882-4f5b-9609-dc4af191f957	43191501	43	** *Office Equipment and Accessories*	19	** *Office Equipment*	15	** *Printers and Photocopiers*	01	** *Production*	t	Certainly! Here's a detailed analysis of the UNSPSC code 43191501:\n\n---\n\n### 1. UNSPSC Code Breakdown and Descriptions\n\n- **Segment (43):** *Office Equipment and Accessories*  \n  This segment includes various types of office-related equipment and accessories used in business environments.\n\n- **Family (19):** *Office Equipment*  \n  Within the segment, this family covers a broader category of office equipment, such as printers, copiers, and related devices.\n\n- **Commodity (15):** *Printers and Photocopiers*  \n  This specific commodity focuses on printing and copying devices, including various types of printers and photocopiers.\n\n- **Business Function (01):** *Production*  \n  This indicates the primary business function related to the procurement or use of this equipment, typically associated with the production or operational activities within an organization.\n\n---\n\n### 2. Validity of the UNSPSC Code\n\n- **Yes,** 43191501 is a valid UNSPSC code. It follows the standard 8-digit format and aligns with the hierarchical structure used in UNSPSC coding.\n\n---\n\n### 3. Products/Services Represented\n\n- **Mainly:**  \n  - Office printers (laser, inkjet, multifunction printers)  \n  - Photocopiers and copy machines  \n  - Possibly related printing devices used in office environments\n\n- **Includes:**  \n  - New or refurbished printers and photocopiers  \n  - Accessories or parts directly related to these devices (if specified further)\n\n---\n\n### 4. Common Uses and Examples\n\n- **Procurement of office printing equipment** for corporate, government, or educational institutions  \n- **Contracting services** for leasing or maintenance of printers and photocopiers  \n- **Inventory management** of office equipment in procurement systems  \n- **Examples:**  \n  - Purchasing a multifunction laser printer for an administrative department  \n  - Contracting a service provider for photocopier maintenance and supplies\n\n---\n\n### Summary for Procurement Professionals:\n- **Code 43191501** refers to *Printers and Photocopiers* within the broader category of *Office Equipment and Accessories.*  \n- It is a valid, standard UNSPSC code used to classify and streamline procurement activities related to printing devices.  \n- Use this code when sourcing, contracting, or managing inventory of office printing equipment.\n\n---\n\nLet me know if you'd like further details or assistance with related codes!	43-19-15-01	gpt-4.1-nano-2025-04-14	2025-06-21 03:27:44.674+04	2025-06-21 03:27:44.674+04
\.


--
-- Data for Name: UnspscCodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UnspscCodes" (id, code, segment, family, class, commodity, title, definition, level, "isActive", "createdAt", "updatedAt") FROM stdin;
11637a09-ca76-40cf-9ccc-03a7f73f4812	31000000	31	00	00	00	Manufacturing Components and Supplies	Manufacturing Components and Supplies - Part of Manufacturing Components and Supplies. Components and supplies used in manufacturing and production	SEGMENT	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.358945+04
59409a36-89d5-4afc-85f9-5da0b9492521	31150000	31	15	00	00	Bearings and bushings and wheels and gears	Bearings and bushings and wheels and gears - Part of Manufacturing Components and Supplies. Industrial bearings, bushings, wheels, and gears used in machinery and equipment	CLASS	t	2025-05-26 21:38:40.956+04	2025-06-16 02:06:52.367321+04
ac0d69b0-23ae-46e3-87b7-433de25d8443	31151500	31	15	15	00	Bearings	Bearings - Part of Manufacturing Components and Supplies. Mechanical components that constrain relative motion and reduce friction between moving parts	CLASS	t	2025-05-26 21:38:40.956+04	2025-06-16 02:06:52.373035+04
4aa6072d-53e1-43a3-8341-baf84ecff0d3	31151700	31	15	17	00	Gears	Gears - Part of Manufacturing Components and Supplies. Mechanical components used to transmit motion and power between machine parts	CLASS	t	2025-05-26 21:38:40.956+04	2025-06-16 02:06:52.386221+04
9bab7371-3692-4fa7-aa10-4ffd94aa558d	43000000	43	00	00	00	Information Technology Broadcasting and Telecommunications	Information Technology Broadcasting and Telecommunications - Part of Information Technology Broadcasting and Telecommunications. Equipment and services for IT, broadcasting, and telecommunications	SEGMENT	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.437424+04
bd9c7c7a-94cf-459a-8b88-3ef991743c43	43210000	43	21	00	00	Computer Equipment and Accessories	Computer Equipment and Accessories - Part of Information Technology Broadcasting and Telecommunications. Computer hardware and peripherals	CLASS	t	2025-05-26 23:18:13.566+04	2025-06-16 02:06:52.448993+04
2d9f61b8-fc25-44f2-bb39-7f9f5611619b	43211500	43	21	15	00	Computers	Computers - Part of Information Technology Broadcasting and Telecommunications. Computing devices for processing data	CLASS	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.454022+04
f613b037-dc42-48de-b78f-5864875b0bfd	43211700	43	11		00	Hard Disk Drives (HDDs)	Hard Disk Drives (HDDs) - Part of Information Technology Broadcasting and Telecommunications. This code covers various types of hard disk drives used for data storage in computing systems, including internal and external models suitable for personal, enterprise, or data center use.	COMMODITY	t	2025-06-16 02:04:06.214594+04	2025-06-16 02:06:52.46655+04
52153a1a-d7c7-4f78-b8e8-b8bcdcd75d55	44000000	44	00	00	00	Office Equipment and Accessories and Supplies	Office Equipment and Accessories and Supplies - Part of Office Equipment and Accessories and Supplies. Equipment, accessories, and supplies used in offices	SEGMENT	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.477962+04
d0ed5142-781f-4381-bebe-73c9e64a461f	44120000	44	12	00	00	Office Supplies	Office Supplies - Part of Office Equipment and Accessories and Supplies. Consumable office supplies used in daily operations	FAMILY	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.483331+04
6ae48c49-afe3-4017-bd85-8d51afc97cbe	43222600	43	22	26	00	iPhone 15 Pro Max	This code pertains to wireless communication devices, suitable for smartphones like the iPhone 15 Pro Max, emphasizing its role as a mobile communication tool.	COMMODITY	t	2025-06-16 02:20:58.237228+04	2025-06-16 02:20:58.237228+04
b1dc72d3-0290-4cb9-a939-17c41a9b0862	53121700	53	12	17	00	iPhone 15 Pro Max	This code is for smartphones, including high-end models like the iPhone 15 Pro Max, focusing on mobile computing devices.	COMMODITY	t	2025-06-16 02:20:58.254458+04	2025-06-16 02:20:58.254458+04
b11f06d2-2124-428c-94a8-5aa9e237e72c	52161500	52	16	15	00	Glass of water	Related to bottled water, but less specific for a generic glass of water.	COMMODITY	t	2025-06-16 02:29:41.630775+04	2025-06-16 02:29:41.630775+04
ad40d67e-00c8-4c9c-a7a6-5a263a634e27	45121500	45	12	15	00	Dictionary	This code covers printed dictionaries used as reference materials, fitting the product description.	COMMODITY	t	2025-06-16 02:44:23.752899+04	2025-06-16 02:44:23.752899+04
a9301b0f-eac2-4206-928f-0219df11f1c5	44103100	44	10	31	00	Dictionary as a published book	Applicable if considering the dictionary as a published book product, though less specific than the first.	COMMODITY	t	2025-06-16 02:44:23.77604+04	2025-06-16 02:44:23.77604+04
ebba4a0d-649f-48a3-b875-8e1ee6fcdd2d	44101502	44	10	15	02	Laser monochrome printers	Includes laser printers, but only monochrome; less relevant but related to laser printing technology.	COMMODITY	t	2025-06-16 02:57:24.739963+04	2025-06-16 02:57:24.739963+04
665a5a8d-f2cd-4f8f-9351-567a42e28d99	40151500	40	15	15	00	Industrial Pump	This code specifically covers industrial pumps used in manufacturing and fluid handling applications, matching the product description accurately.	COMMODITY	t	2025-06-16 03:30:36.068253+04	2025-06-16 03:30:36.068253+04
b9d0113d-528a-4005-bfd1-1bab5fc0c4f8	40151600	40	15	16	00	Pump Accessories	Related to pump components and accessories, but less specific than the primary pump classification.	COMMODITY	t	2025-06-16 03:30:36.159377+04	2025-06-16 03:30:36.159377+04
9ffe8ee0-4126-46ab-b249-1c3451ce5b14	40141600	40	14	16	00	Ball Valve	This code specifically covers ball valves used in industrial piping systems, matching the product description accurately.	COMMODITY	t	2025-06-16 03:30:38.397366+04	2025-06-16 03:30:38.397366+04
f799126c-24be-434f-9460-dd313a1ac9bd	40141700	40	14	17	00	Gate, Globe, and Check Valves	Includes various types of valves, but less specific than ball valves; relevant if ball valves are part of a broader valve category.	COMMODITY	t	2025-06-16 03:30:38.495421+04	2025-06-16 03:30:38.495421+04
0bd29936-58ca-4f69-a661-302bc164af61	27112800	27	11	28	00	Electric motors	This code specifically covers electric motors, including various types used in industrial and commercial applications, matching the product description precisely.	COMMODITY	t	2025-06-16 03:30:41.224146+04	2025-06-16 03:30:41.224146+04
a5965d17-6573-43cf-a032-86f2e367f703	27112801	27	11	28	01	AC electric motors	This code specifies AC electric motors, a common type of electric motor, relevant if the product is specifically AC-powered.	COMMODITY	t	2025-06-16 03:30:41.319579+04	2025-06-16 03:30:41.319579+04
b409bbf1-65eb-4497-bb8c-02ca6ccdd715	27112802	27	11	28	02	DC electric motors	This code pertains to DC electric motors, relevant if the motor is powered by direct current, providing an alternative classification.	COMMODITY	t	2025-06-16 03:30:41.329075+04	2025-06-16 03:30:41.329075+04
f2cbde8e-d338-42e1-8e93-7276ce16ef68	31151501	31	15	15	01	Ball bearings	Ball bearings - Part of Manufacturing Components and Supplies. Rolling-element bearings that use balls to maintain separation between bearing races	COMMODITY	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.379393+04
5ab14bbe-fbd9-4b7d-a476-b5772f7f2060	32121503	32	12	15	03	Manual UNSPSC Code: 32/12/15/03	Manual UNSPSC Code: 32/12/15/03 - Part of Electronic Components and Supplies. Manually entered UNSPSC code: 32121503	COMMODITY	t	2025-05-29 22:03:17.249+04	2025-06-16 02:06:52.391999+04
f0e579bd-1b6a-4c79-a029-20022b936bb9	40000000	40	00	00	00	Laboratory, Measuring and Observing Equipment	Laboratory, Measuring and Observing Equipment - Part of Distribution and Conditioning Systems and Equipment and Components. AI-generated segment: Laboratory, Measuring and Observing Equipment	SEGMENT	t	2025-05-29 17:32:04.78+04	2025-06-16 02:06:52.397375+04
9a8d6034-4169-4941-ab96-7f7ce55c4663	40100000	40	10	00	00	Heating and ventilation and air circulation	Heating and ventilation and air circulation - Part of Distribution and Conditioning Systems and Equipment and Components. AI-generated family: Heating and ventilation and air circulation	FAMILY	t	2025-05-29 17:50:43.365+04	2025-06-16 02:06:52.403563+04
85d68e2c-e58a-440d-a0c1-d839e9710318	40101500	40	10	15	00	Space heaters	Space heaters - Part of Distribution and Conditioning Systems and Equipment and Components. AI-generated class: Space heaters	CLASS	t	2025-05-29 17:50:43.39+04	2025-06-16 02:06:52.409937+04
7e2e3f89-27c2-441a-b5ec-468f5b692c94	40101505	40	10	15	05	Infrared heaters	Infrared heaters - Part of Distribution and Conditioning Systems and Equipment and Components. AI-generated commodity: Infrared heaters	COMMODITY	t	2025-05-29 17:50:43.396+04	2025-06-16 02:06:52.415392+04
36e09bef-8240-43e0-801e-d5bded58cf03	40140000	40	14	00	00	Laboratory equipment and supplies	Laboratory equipment and supplies - Part of Distribution and Conditioning Systems and Equipment and Components. AI-generated family: Laboratory equipment and supplies	FAMILY	t	2025-05-29 17:32:04.788+04	2025-06-16 02:06:52.421007+04
94f471db-3fbc-43a7-b6ce-21b2add2de45	40141800	40	14	18	00	Laboratory centrifuges	Laboratory centrifuges - Part of Distribution and Conditioning Systems and Equipment and Components. AI-generated class: Laboratory centrifuges	CLASS	t	2025-05-29 17:32:04.795+04	2025-06-16 02:06:52.427052+04
f5b54e6f-7851-4e51-8e11-76a923e2ac38	43211501	43	21	15	01	Desktop computers	Desktop computers - Part of Information Technology Broadcasting and Telecommunications. Personal computers designed to stay in a single location	COMMODITY	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.460741+04
7341e5f8-693c-447f-9cfa-a419780f3eff	43211706	43	21	17	06	Computer monitors	Computer monitors - Part of Information Technology Broadcasting and Telecommunications. 	COMMODITY	t	2025-05-29 20:49:34.353+04	2025-06-16 02:06:52.472247+04
a60e88e5-d4ad-48c2-8c66-872def9a246d	44121700	44	12	17	00	Writing instruments	Writing instruments - Part of Office Equipment and Accessories and Supplies. Pens, pencils, markers and other writing implements	CLASS	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.488734+04
3d8b35de-ec7e-4c65-9f92-33f032fb528f	44121701	44	12	17	01	Pens	Pens - Part of Office Equipment and Accessories and Supplies. Writing instruments that use ink	COMMODITY	t	2025-05-26 23:26:26.611+04	2025-06-16 02:06:52.49405+04
c25a0e9d-028b-40f9-9664-4a099fb8a622	51000000	51	00	00	00	Drugs and Pharmaceutical Products	Drugs and Pharmaceutical Products - Part of Drugs and Pharmaceutical Products. Pharmaceutical products including medicines, vitamins, and health supplements	SEGMENT	t	2025-05-27 19:53:02.908+04	2025-06-16 02:06:52.500837+04
f2312d7b-6354-4dec-b870-ebbcc1d489d6	51160000	51	16	00	00	Vitamins and Nutritional Supplements	Vitamins and Nutritional Supplements - Part of Drugs and Pharmaceutical Products. Vitamins, minerals, and nutritional supplements	FAMILY	t	2025-05-27 19:53:02.943+04	2025-06-16 02:06:52.507257+04
76da9574-d703-4259-b9e5-895478f138af	51161500	51	16	15	00	Vitamins and nutrients	Vitamins and nutrients - Part of Drugs and Pharmaceutical Products. Essential vitamins and nutrients for health	CLASS	t	2025-05-27 19:53:02.951+04	2025-06-16 02:06:52.5125+04
fd16d1b3-ebfc-4ef2-8ea1-a8fb5749d1da	55000000	55	00	00	00	Printed Media, Digital Media and Publishing and Printing Services	Printed Media, Digital Media and Publishing and Printing Services - Part of Printed Media. AI-generated segment: Printed Media, Digital Media and Publishing and Printing Services	SEGMENT	t	2025-05-29 17:31:56.458+04	2025-06-16 02:06:52.517767+04
ded1c014-338e-4405-96f1-8d339e3010ec	55100000	55	10	00	00	Books and brochures	Books and brochures - Part of Printed Media. AI-generated family: Books and brochures	FAMILY	t	2025-05-29 17:31:56.486+04	2025-06-16 02:06:52.523092+04
838b8c98-caa5-4ccd-aa7a-cd1935035d7e	55101500	55	10	15	00	Educational books and brochures	Educational books and brochures - Part of Printed Media. AI-generated class: Educational books and brochures	CLASS	t	2025-05-29 17:31:56.493+04	2025-06-16 02:06:52.528334+04
e3095c0d-b414-4fa0-b8cc-a3a640db1f9a	55101502	55	10	15	02	Manual UNSPSC Code: 55/10/15/02	Manual UNSPSC Code: 55/10/15/02 - Part of Printed Media. Manually entered UNSPSC code: 55101502	COMMODITY	t	2025-05-29 20:14:37.528+04	2025-06-16 02:06:52.533881+04
a322e62e-42e7-4ddc-b307-26322a8405ab	55101507	55	10	15	07	Printed books	Printed books - Part of Printed Media. Printed educational books	COMMODITY	t	2025-05-29 18:21:25.449+04	2025-06-16 02:06:52.539323+04
4e13eedc-edd0-4545-9d3c-219d0ad14491	43211507	43	11			Hard disk drives	Hard disk drives (HDDs) are magnetic storage devices used in computers and servers for data storage, offering large capacity and reliable performance.	COMMODITY	t	2025-06-16 02:07:21.460015+04	2025-06-16 02:07:21.460015+04
a86b1d25-af5c-4f11-a637-e882f495811e	53131601	53	13	16	01	Reusable water bottles	This code pertains to reusable water bottles, which are common water containers for personal use, aligning well with the product description.	COMMODITY	t	2025-06-16 02:21:40.69969+04	2025-06-16 02:21:40.69969+04
1d97eec5-a59b-4cf3-ba5b-3e01cf553d37	24112400	24	11	24	00	Bottled water	This code relates to bottled water as a beverage, but is less specific to containers like water bottles, making it a secondary option.	COMMODITY	t	2025-06-16 02:21:40.712325+04	2025-06-16 02:21:40.712325+04
677652ba-fa65-435b-927d-d522eee7f3de	44101500	44	10	15	00	Wallpaper	This code specifically covers wallpaper, a type of wall covering used in interior decoration, matching the product description accurately.	COMMODITY	t	2025-06-16 02:31:52.239248+04	2025-06-16 02:31:52.239248+04
d5f4b004-2386-4e81-b3a8-318a9fbd9f3e	44101700	44	10	17	00	Wall coverings, other	This code includes various wall coverings besides wallpaper, suitable if the product is a different type of wall covering.	COMMODITY	t	2025-06-16 02:31:52.253243+04	2025-06-16 02:31:52.253243+04
5139724a-ccd7-420a-81b5-5f1de7a6ebb3	53102304	53	10	23	04	Jerseys	This code specifically covers jerseys, including sports and casual styles, within the clothing category, making it the most precise match.	COMMODITY	t	2025-06-16 02:46:02.301496+04	2025-06-16 02:46:02.301496+04
ba513abe-2e47-465a-96ee-b4b863c1dcc2	53102202	53	10	22	02	T-shirts	Includes casual tops similar to jerseys, but less specific; relevant if jerseys are considered similar to T-shirts.	COMMODITY	t	2025-06-16 02:46:02.31601+04	2025-06-16 02:46:02.31601+04
6cb8183a-7db9-4c48-b1fd-71bfd7eff34f	44101501	44	10	15	01	Inkjet printers	This code pertains to inkjet printers, another common type of printer, relevant to the product description.	COMMODITY	t	2025-06-16 03:00:50.296602+04	2025-06-16 03:00:50.296602+04
c76914bd-beef-49be-af6f-8045b8d8d541	42142603	42	14	26	03	Manual UNSPSC Code: 42/14/26/03	Manual UNSPSC Code: 42/14/26/03 - Part of Medical Equipment and Accessories and Supplies. Manually entered UNSPSC code: 42142603	COMMODITY	t	2025-05-30 17:46:19.342+04	2025-06-16 02:06:52.43219+04
e9c82ca1-77d8-4dba-bd2e-0178288ef4ac	43191500	43	19	15	00	Manual UNSPSC Code: 43/19/15/00	Manual UNSPSC Code: 43/19/15/00 - Part of Information Technology Broadcasting and Telecommunications. Manually entered UNSPSC code: 43191500	COMMODITY	t	2025-06-07 23:31:56.677+04	2025-06-16 02:06:52.443529+04
9e0b54e1-1f33-42a6-8772-27dd0e70314f	53131600	53	13	16	00	iPhone 15 Pro Max	The code 53131600 accurately classifies smartphones, including high-end models like the iPhone 15 Pro Max, under mobile phones in computer equipment.	COMMODITY	t	2025-06-16 02:14:11.021+04	2025-06-16 02:14:11.021+04
c0060758-bbd2-4330-9dcc-3e393acdc8f0	53131602	53	13	16	02	iPhone 15 Pro Max	Specifically classifies advanced smartphones like the iPhone 15 Pro Max within the mobile phones category.	COMMODITY	t	2025-06-16 02:14:11.039457+04	2025-06-16 02:14:11.039457+04
ba4b5329-31b2-4b89-a3c5-ff3dacbcb465	53121702	53	12	17	02	Water bottles	This code specifically covers bottles used for water, including reusable and disposable types, fitting the product description accurately.	COMMODITY	t	2025-06-16 02:26:31.27233+04	2025-06-16 02:26:31.27233+04
5fde481f-7a28-4868-a785-5ae5e525df97	39121500	39	12	15	00	Water bottles for household use	This code includes household water bottles, but is broader and less specific than the first option.	COMMODITY	t	2025-06-16 02:26:31.287026+04	2025-06-16 02:26:31.287026+04
f656deab-83ef-4215-a7a0-07b903368c1f	43211902	43	21	19	02	Monitor	This code specifically covers computer monitors, aligning directly with the product description.	COMMODITY	t	2025-06-16 02:42:07.594748+04	2025-06-16 02:42:07.594748+04
f2527584-d460-4dc5-b720-8289f64d15ec	43211701	43	21	17	01	Monitor	This code pertains to display devices, including monitors, but is broader than the specific computer monitor category.	COMMODITY	t	2025-06-16 02:42:07.610156+04	2025-06-16 02:42:07.610156+04
702d545d-8ba1-4757-aa0c-b573c8a1ece9	43211800	43	21	18	00	Monitor	This code includes accessories related to displays, but is less specific to monitors themselves.	COMMODITY	t	2025-06-16 02:42:07.618372+04	2025-06-16 02:42:07.618372+04
7e979306-2a08-4f99-9ccc-d55f9f1bec11	43211601	43	21	16	01	Display monitor	This code pertains to display monitors generally, including various types of screens used for visual display.	COMMODITY	t	2025-06-16 02:42:18.667737+04	2025-06-16 02:42:18.667737+04
28396ca5-f0ad-45e9-9acb-a1dd1ba9ba37	44101503	44	10	15	03	Printers	This code specifically covers printers, including various types of printing devices used in offices and industries.	COMMODITY	t	2025-06-16 02:56:10.400456+04	2025-06-16 02:56:10.400456+04
cbf8eb68-57e9-4251-9f8d-00dc3398a791	44101504	44	10	15	04	Multifunction printers	This code pertains to multifunction printers that combine printing, scanning, and copying functions.	COMMODITY	t	2025-06-16 02:56:10.418282+04	2025-06-16 02:56:10.418282+04
300c4c83-6d4e-425f-a39c-8c9d4dcd1a54	44101600	44	10	16	00	Printer consumables	This code includes consumables for printers, such as ink cartridges and toner, related to printer products.	COMMODITY	t	2025-06-16 02:56:10.426596+04	2025-06-16 02:56:10.426596+04
eb4ec3f5-738b-4088-b3c0-f2184498123a	43211503	43	21	15	03	Samsung 10s Smartphone	The code 43211503 corresponds to smartphones, including Samsung models like the Galaxy S10 series, matching the product description.	COMMODITY	t	2025-06-16 03:23:11.433987+04	2025-06-16 03:23:11.433987+04
\.


--
-- Data for Name: UserUnspscFavorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserUnspscFavorites" (id, "userId", "unspscCode", title, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, name, email, password, role, "createItemMaster", "editItemMaster", "approveItemMaster", "setInventoryLevels", "createReorderRequests", "approveReorderRequests", "warehouseTransactions", "createdAt", "updatedAt", "isActive") FROM stdin;
5a772bde-25ca-4ccb-ad50-e11b01899a87	Test User	test@example.com	$2a$10$bR8XeBqj7fZgplld1fWG5eZ268z62Vncyea.Ii.SvvAuRRbAF0yFy	staff	f	f	f	f	f	f	f	2025-05-29 20:49:34.094+04	2025-05-29 20:49:34.094+04	t
0b4afa3e-8582-452b-833c-f8bf695c4d60	System Administrator	admin@erp.com	$2a$10$oUCFEn//fi9mxiCAQGJ7tOsuXOv4Jt5v3HqR9.XdE8ZN1dJcozVbe	admin	t	t	t	t	t	t	t	2025-05-26 21:38:40.815+04	2025-05-26 21:42:57.179+04	t
\.


--
-- Data for Name: Warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Warehouses" (id, "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: unspsc_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unspsc_codes (id, code, segment, family, class, commodity, title, definition, level, is_active, created_at, updated_at) FROM stdin;
0596efd6-a66f-4309-a216-f3fdb01bf94a	14000000	14	00	00	00	Paper Materials and Products	Paper products and materials	SEGMENT	t	2025-06-15 21:57:24.67477+04	2025-06-15 21:57:24.67477+04
253e785d-de68-4708-9dfa-0c455a7c43d8	14160000	14	16	00	00	Office supplies	Office supplies and materials	FAMILY	t	2025-06-15 21:57:24.67477+04	2025-06-15 21:57:24.67477+04
22d3654f-14be-4223-a3fd-8397a6d493cb	14160700	14	16	07	00	Office machine supplies	Supplies for office machines including printers	CLASS	t	2025-06-15 21:57:24.67477+04	2025-06-15 21:57:24.67477+04
329cdf0d-bc38-42a8-9846-a8f5993a4c67	14160704	14	16	07	04	Printer or photocopier toner	Toner for printers and photocopiers	COMMODITY	t	2025-06-15 21:57:24.67477+04	2025-06-15 21:57:24.67477+04
0a4a371a-5bc1-45b2-96aa-545961d4dc73	14160708	14	16	07	08	Auto-created UNSPSC Code: 14160708	\N	COMMODITY	t	2025-06-15 22:02:27.479+04	2025-06-15 22:02:27.479+04
77794b4c-9827-4f3d-9422-d05f7fa7d1e8	14160022	14	16	00	22	Auto-created UNSPSC Code: 14160022	\N	COMMODITY	t	2025-06-15 22:10:05.105+04	2025-06-15 22:10:05.105+04
3a540bdc-0b2f-4303-8dc2-6eb9c1b69604	14540022	14	54	00	22	Manual UNSPSC Code: 14/54/00/22	Manually entered UNSPSC code: 14540022	COMMODITY	t	2025-06-15 22:45:18.547+04	2025-06-15 22:45:18.547+04
\.


--
-- Data for Name: user_unspsc_favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_unspsc_favorites (id, "userId", name, description, "unspscCode", level, title, segment, family, class, commodity, "isDefault", "createdAt", "updatedAt", "segmentTitle", "familyTitle", "classTitle", "commodityTitle", created_at, updated_at) FROM stdin;
bdccd804-148c-4dda-adbd-53ce81b1a2ad	0b4afa3e-8582-452b-833c-f8bf695c4d60	dfdf	\N	40141800	CLASS	Water treatment and supply equipment	40	14	18	00	t	2025-05-29 13:31:18.879+04	2025-05-29 20:58:29.625+04	Laboratory and Measuring and Observing and Testing Equipment	Laboratory equipment	Laboratory supplies	General laboratory supplies	2025-05-29 13:31:18.879+04	2025-05-29 20:58:29.625+04
\.


--
-- Data for Name: user_unspsc_hierarchy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_unspsc_hierarchy (id, "userId", "unspscCode", level, title, segment, "segmentTitle", family, "familyTitle", class, "classTitle", commodity, "commodityTitle", "useFrequency", "lastUsed", "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
7d7bd791-24e6-42d9-bc83-cfd1f9296056	0b4afa3e-8582-452b-833c-f8bf695c4d60	44000000	SEGMENT	Office Equipment and Accessories and Supplies	44	Office Equipment and Accessories and Supplies	\N	\N	\N	\N	\N	\N	4	2025-05-28 15:43:06.975+04	2025-05-27 20:28:32.247+04	2025-05-28 15:43:06.975+04	2025-05-27 20:28:32.247+04	2025-05-28 15:43:06.975+04
b3857c85-1eb6-4afa-8d64-687700d2ba41	0b4afa3e-8582-452b-833c-f8bf695c4d60	44120000	FAMILY	Office Supplies	44	Office Equipment and Accessories and Supplies	12	Office Supplies	\N	\N	\N	\N	1	2025-05-28 15:43:07.86+04	2025-05-28 15:43:07.867+04	2025-05-28 15:43:07.867+04	2025-05-28 15:43:07.867+04	2025-05-28 15:43:07.867+04
0f31edee-141c-4ed8-8c8a-3fb5adc20eee	0b4afa3e-8582-452b-833c-f8bf695c4d60	51000000	SEGMENT	Drugs and Pharmaceutical Products	51	Drugs and Pharmaceutical Products	\N	\N	\N	\N	\N	\N	24	2025-05-29 13:21:55.013+04	2025-05-27 20:28:32.228+04	2025-05-29 13:21:55.014+04	2025-05-27 20:28:32.228+04	2025-05-29 13:21:55.014+04
e03194b3-9879-44c1-8384-ee01ad21679f	0b4afa3e-8582-452b-833c-f8bf695c4d60	51160000	FAMILY	Vitamins and Nutritional Supplements	51	Drugs and Pharmaceutical Products	16	Vitamins and Nutritional Supplements	\N	\N	\N	\N	20	2025-05-29 13:22:02.824+04	2025-05-28 12:09:21.47+04	2025-05-29 13:22:02.825+04	2025-05-28 12:09:21.47+04	2025-05-29 13:22:02.825+04
f248f20f-7e6f-49cd-9d1f-82ede33f1988	0b4afa3e-8582-452b-833c-f8bf695c4d60	51161500	COMMODITY	Vitamins and nutrients	51	Drugs and Pharmaceutical Products	5116	Vitamins and Nutritional Supplements	511615	Vitamins and nutrients	51161500	\N	39	2025-05-29 13:22:05.585+04	2025-05-27 20:22:02.4+04	2025-05-29 13:22:05.585+04	2025-05-27 20:22:02.4+04	2025-05-29 13:22:05.585+04
32acc5b9-789b-4875-9070-55b25a42cb60	0b4afa3e-8582-452b-833c-f8bf695c4d60	43000000	SEGMENT	Information Technology Broadcasting and Telecommunications	43	Information Technology Broadcasting and Telecommunications	\N	\N	\N	\N	\N	\N	7	2025-05-29 13:52:31.365+04	2025-05-27 20:28:32.26+04	2025-05-29 13:52:31.366+04	2025-05-27 20:28:32.26+04	2025-05-29 13:52:31.366+04
d6f18b6c-c02b-4cf0-a747-ebe03d1ed72e	0b4afa3e-8582-452b-833c-f8bf695c4d60	31000000	SEGMENT	Manufacturing Components and Supplies	31	Manufacturing Components and Supplies	\N	\N	\N	\N	\N	\N	3	2025-05-28 12:35:10.456+04	2025-05-27 20:28:32.264+04	2025-05-28 12:35:10.456+04	2025-05-27 20:28:32.264+04	2025-05-28 12:35:10.456+04
\.


--
-- Name: ApprovalHistories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ApprovalHistories_id_seq"', 44, true);


--
-- Name: DelegationOfAuthorities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DelegationOfAuthorities_id_seq"', 1, false);


--
-- Name: Warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Warehouses_id_seq"', 1, false);


--
-- Name: ApprovalHistories ApprovalHistories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ApprovalHistories"
    ADD CONSTRAINT "ApprovalHistories_pkey" PRIMARY KEY (id);


--
-- Name: BinLocations BinLocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BinLocations"
    ADD CONSTRAINT "BinLocations_pkey" PRIMARY KEY (id);


--
-- Name: ContractItems ContractItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContractItems"
    ADD CONSTRAINT "ContractItems_pkey" PRIMARY KEY (id);


--
-- Name: Contracts Contracts_contractNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key1" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key10" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key11" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key12" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key13" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key14" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key15" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key16" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key17" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key18" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key19" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key2" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key20" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key21" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key22" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key23" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key24" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key25" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key26" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key27" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key28" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key29" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key3" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key30" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key31" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key32" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key4" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key5" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key6" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key7" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key8" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_contractNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_contractNumber_key9" UNIQUE ("contractNumber");


--
-- Name: Contracts Contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_pkey" PRIMARY KEY (id);


--
-- Name: DelegationOfAuthorities DelegationOfAuthorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DelegationOfAuthorities"
    ADD CONSTRAINT "DelegationOfAuthorities_pkey" PRIMARY KEY (id);


--
-- Name: Inventories Inventories_inventoryNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key1" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key10" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key100" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key101" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key102" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key103" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key104" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key105" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key106" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key107" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key108" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key109" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key11" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key110" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key111" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key112" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key113" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key114" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key115" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key116" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key117" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key118" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key119" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key12" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key120" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key121" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key122" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key123" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key124" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key125" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key126" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key127" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key128" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key129" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key13" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key130" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key131" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key132" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key133" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key134" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key135" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key136" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key137" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key138" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key139" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key14" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key140" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key141" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key142" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key143" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key144" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key145" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key146" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key147" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key148" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key149" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key15" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key150" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key151" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key152" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key153" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key154" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key155" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key156" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key157" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key158" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key159" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key16" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key160" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key161" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key162" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key163" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key164" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key165" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key166" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key167" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key168" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key169" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key17" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key170" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key171" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key172" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key173" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key174" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key175" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key176" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key177" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key178" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key179" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key18" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key180" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key181" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key182" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key183" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key184" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key185" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key186" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key187" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key188" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key189" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key19" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key190" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key191" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key192" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key193" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key194" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key195" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key196" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key197" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key198" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key199" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key2" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key20" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key200" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key201" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key202" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key203" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key204" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key205" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key206" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key207" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key208" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key209" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key21" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key210" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key211" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key212" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key213" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key214" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key215" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key216" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key217" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key218" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key219" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key22" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key220" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key221" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key222" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key223" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key224" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key225" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key226" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key227" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key228" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key229" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key23" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key230" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key231" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key232" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key233" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key234" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key235" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key236" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key237" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key238" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key239" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key24" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key240" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key241" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key242" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key243" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key244" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key245" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key246" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key247" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key248" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key249" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key25" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key250" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key251" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key252" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key253" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key254" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key255" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key256" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key257" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key258" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key259" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key26" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key260" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key261" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key262" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key263" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key264" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key265" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key266" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key267" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key268" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key269" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key27" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key270" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key271" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key272" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key273" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key274" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key275" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key276" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key277" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key278" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key279" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key28" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key280" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key281" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key282" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key283" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key284" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key285" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key286" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key287" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key288" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key289" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key29" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key290" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key291" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key292" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key293" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key294" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key295" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key296" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key297" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key298" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key299" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key3" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key30" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key300" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key301" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key302" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key303" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key304" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key305" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key306" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key307" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key308" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key309" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key31" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key310" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key311" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key312" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key313" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key314" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key315" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key316" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key317" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key318" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key319" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key32" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key320" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key321" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key322" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key323" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key324" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key325" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key326" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key327" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key328" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key329" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key33" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key330" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key331" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key332" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key333" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key334" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key335" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key336" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key337" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key338" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key339" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key34" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key340" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key341" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key342" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key343" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key344" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key345" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key346" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key347" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key348" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key349" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key35" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key350" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key351" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key352" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key353" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key354" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key355" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key356" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key357" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key358" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key359" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key36" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key360" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key361" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key362" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key363" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key364" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key365" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key366" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key367" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key368" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key369" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key37" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key370" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key371" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key372" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key373" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key374" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key375" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key376" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key377" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key378" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key379" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key38" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key380" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key381" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key382" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key383" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key384" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key385" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key386" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key387" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key388" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key389" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key39" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key390" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key391" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key392" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key393" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key394" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key395" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key396" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key397; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key397" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key398; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key398" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key399; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key399" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key4" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key40" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key400; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key400" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key401; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key401" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key402; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key402" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key403; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key403" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key404; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key404" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key405; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key405" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key406" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key407; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key407" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key408; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key408" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key409; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key409" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key41" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key410" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key411; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key411" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key412" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key413; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key413" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key414; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key414" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key415" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key416; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key416" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key417; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key417" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key418; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key418" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key419; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key419" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key42" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key420; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key420" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key421; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key421" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key422; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key422" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key423; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key423" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key424; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key424" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key425; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key425" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key426; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key426" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key427; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key427" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key428; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key428" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key429" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key43" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key430; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key430" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key431; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key431" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key432; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key432" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key433" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key434; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key434" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key435; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key435" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key436; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key436" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key437; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key437" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key438; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key438" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key439" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key44" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key440; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key440" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key441; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key441" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key442; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key442" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key443; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key443" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key444; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key444" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key445; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key445" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key446; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key446" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key447; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key447" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key448; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key448" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key449; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key449" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key45" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key450; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key450" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key451; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key451" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key46" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key47" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key48" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key49" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key5" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key50" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key51" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key52" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key53" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key54" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key55" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key56" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key57" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key58" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key59" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key6" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key60" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key61" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key62" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key63" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key64" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key65" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key66" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key67" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key68" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key69" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key7" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key70" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key71" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key72" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key73" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key74" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key75" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key76" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key77" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key78" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key79" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key8" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key80" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key81" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key82" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key83" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key84" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key85" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key86" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key87" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key88" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key89" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key9" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key90" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key91" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key92" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key93" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key94" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key95" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key96" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key97" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key98" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_inventoryNumber_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_inventoryNumber_key99" UNIQUE ("inventoryNumber");


--
-- Name: Inventories Inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_pkey" PRIMARY KEY (id);


--
-- Name: ItemMasters ItemMasters_itemNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key1" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key10" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key100" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key101" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key102" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key103" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key104" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key105" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key106" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key107" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key108" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key109" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key11" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key110" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key111" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key112" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key113" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key114" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key115" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key116" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key117" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key118" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key119" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key12" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key120" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key121" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key122" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key123" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key124" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key125" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key126" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key127" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key128" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key129" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key13" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key130" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key131" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key132" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key133" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key134" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key135" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key136" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key137" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key138" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key139" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key14" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key140" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key141" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key142" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key143" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key144" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key145" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key146" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key147" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key148" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key149" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key15" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key150" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key151" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key152" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key153" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key154" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key155" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key156" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key157" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key158" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key159" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key16" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key160" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key161" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key162" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key163" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key164" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key165" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key166" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key167" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key168" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key169" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key17" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key170" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key171" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key172" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key173" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key174" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key175" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key176" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key177" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key178" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key179" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key18" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key180" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key181" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key182" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key183" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key184" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key185" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key186" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key187" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key188" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key189" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key19" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key190" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key191" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key192" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key193" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key194" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key195" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key196" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key197" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key198" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key199" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key2" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key20" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key200" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key201" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key202" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key203" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key204" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key205" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key206" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key207" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key208" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key209" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key21" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key210" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key211" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key212" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key213" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key214" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key215" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key216" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key217" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key218" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key219" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key22" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key220" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key221" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key222" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key223" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key224" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key225" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key226" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key227" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key228" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key229" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key23" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key230" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key231" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key232" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key233" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key234" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key235" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key236" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key237" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key238" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key239" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key24" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key240" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key241" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key242" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key243" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key244" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key245" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key246" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key247" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key248" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key249" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key25" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key250" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key251" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key252" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key253" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key254" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key255" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key256" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key257" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key258" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key259" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key26" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key260" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key261" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key262" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key263" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key264" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key265" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key266" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key267" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key268" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key269" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key27" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key270" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key271" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key272" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key273" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key274" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key275" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key276" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key277" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key278" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key279" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key28" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key280" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key281" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key282" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key283" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key284" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key285" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key286" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key287" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key288" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key289" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key29" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key290" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key291" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key292" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key293" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key294" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key295" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key296" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key297" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key298" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key299" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key3" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key30" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key300" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key301" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key302" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key303" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key304" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key305" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key306" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key307" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key308" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key309" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key31" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key310" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key311" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key312" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key313" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key314" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key315" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key316" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key317" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key318" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key319" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key32" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key320" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key321" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key322" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key323" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key324" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key325" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key326" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key327" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key328" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key329" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key33" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key330" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key331" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key332" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key333" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key334" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key335" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key336" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key337" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key338" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key339" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key34" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key340" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key341" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key342" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key343" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key344" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key345" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key346" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key347" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key348" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key349" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key35" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key350" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key351" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key352" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key353" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key354" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key355" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key356" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key357" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key358" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key359" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key36" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key360" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key361" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key362" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key363" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key364" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key365" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key366" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key367" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key368" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key369" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key37" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key370" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key371" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key372" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key373" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key374" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key375" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key376" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key377" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key378" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key379" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key38" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key380" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key381" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key382" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key383" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key384" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key385" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key386" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key387" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key388" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key389" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key39" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key390" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key391" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key392" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key393" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key394" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key395" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key396" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key397; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key397" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key398; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key398" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key399; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key399" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key4" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key40" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key400; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key400" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key401; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key401" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key402; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key402" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key403; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key403" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key404; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key404" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key405; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key405" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key406" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key407; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key407" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key408; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key408" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key409; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key409" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key41" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key410" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key411; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key411" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key412" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key413; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key413" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key414; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key414" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key415" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key416; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key416" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key417; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key417" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key418; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key418" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key419; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key419" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key42" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key420; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key420" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key421; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key421" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key422; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key422" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key423; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key423" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key424; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key424" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key425; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key425" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key426; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key426" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key427; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key427" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key428; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key428" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key429" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key43" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key430; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key430" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key431; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key431" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key432; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key432" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key433" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key434; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key434" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key435; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key435" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key436; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key436" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key437; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key437" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key438; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key438" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key439" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key44" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key440; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key440" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key441; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key441" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key442; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key442" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key443; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key443" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key444; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key444" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key445; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key445" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key446; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key446" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key447; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key447" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key448; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key448" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key449; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key449" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key45" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key450; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key450" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key451; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key451" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key452; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key452" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key453; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key453" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key454; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key454" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key455; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key455" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key456; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key456" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key457; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key457" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key458; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key458" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key459; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key459" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key46" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key460; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key460" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key461; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key461" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key462; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key462" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key463; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key463" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key464; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key464" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key465; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key465" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key466; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key466" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key467; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key467" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key468; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key468" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key469; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key469" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key47" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key470; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key470" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key471; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key471" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key472; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key472" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key473; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key473" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key474; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key474" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key48" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key49" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key5" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key50" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key51" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key52" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key53" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key54" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key55" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key56" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key57" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key58" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key59" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key6" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key60" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key61" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key62" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key63" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key64" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key65" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key66" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key67" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key68" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key69" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key7" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key70" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key71" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key72" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key73" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key74" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key75" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key76" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key77" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key78" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key79" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key8" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key80" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key81" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key82" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key83" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key84" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key85" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key86" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key87" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key88" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key89" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key9" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key90" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key91" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key92" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key93" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key94" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key95" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key96" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key97" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key98" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_itemNumber_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_itemNumber_key99" UNIQUE ("itemNumber");


--
-- Name: ItemMasters ItemMasters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseOrderItems PurchaseOrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrderItems"
    ADD CONSTRAINT "PurchaseOrderItems_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseOrders PurchaseOrders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key1" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key10" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key11" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key12" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key13" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key14" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key15" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key16" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key17" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key18" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key19" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key2" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key20" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key21" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key22" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key23" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key24" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key25" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key26" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key27" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key28" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key29" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key3" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key30" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key31" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key4" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key5" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key6" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key7" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key8" UNIQUE ("poNumber");


--
-- Name: PurchaseOrders PurchaseOrders_poNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_poNumber_key9" UNIQUE ("poNumber");


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseRequisitions PurchaseRequisitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key1" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key10" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key11" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key12" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key13" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key14" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key15" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key16" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key17" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key18" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key19" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key2" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key20" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key21" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key22" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key23" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key24" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key25" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key26" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key27" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key28" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key29" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key3" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key30" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key31" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key32" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key4" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key5" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key6" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key7" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key8" UNIQUE ("prNumber");


--
-- Name: PurchaseRequisitions PurchaseRequisitions_prNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_prNumber_key9" UNIQUE ("prNumber");


--
-- Name: RejectionNotifications RejectionNotifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RejectionNotifications"
    ADD CONSTRAINT "RejectionNotifications_pkey" PRIMARY KEY (id);


--
-- Name: ReorderRequestItems ReorderRequestItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequestItems"
    ADD CONSTRAINT "ReorderRequestItems_pkey" PRIMARY KEY (id);


--
-- Name: ReorderRequests ReorderRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_pkey" PRIMARY KEY (id);


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key1" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key10" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key100" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key101" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key102" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key103" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key104" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key105" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key106" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key107" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key108" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key109" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key11" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key110" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key111" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key112" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key113" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key114" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key115" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key116" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key117" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key118" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key119" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key12" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key120" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key121" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key122" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key123" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key124" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key125" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key126" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key127" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key128" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key129" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key13" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key130" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key131" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key132" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key133" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key134" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key135" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key136" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key137" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key138" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key139" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key14" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key140" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key141" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key142" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key143" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key144" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key145" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key146" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key147" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key148" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key149" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key15" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key150" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key151" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key152" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key153" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key154" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key155" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key156" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key157" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key158" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key159" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key16" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key160" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key161" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key162" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key163" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key164" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key165" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key166" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key167" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key168" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key169" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key17" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key170" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key171" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key172" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key173" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key174" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key175" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key176" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key177" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key178" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key179" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key18" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key180" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key181" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key182" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key183" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key184" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key185" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key186" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key187" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key188" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key189" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key19" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key190" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key191" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key192" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key193" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key194" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key195" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key196" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key197" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key198" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key199" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key2" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key20" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key200" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key201" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key202" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key203" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key204" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key205" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key206" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key207" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key208" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key209" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key21" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key210" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key211" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key212" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key213" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key214" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key215" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key216" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key217" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key218" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key219" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key22" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key220" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key221" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key222" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key223" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key224" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key225" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key226" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key227" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key228" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key229" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key23" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key230" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key231" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key232" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key233" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key234" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key235" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key236" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key237" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key238" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key239" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key24" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key240" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key241" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key242" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key243" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key244" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key245" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key246" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key247" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key248" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key249" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key25" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key250" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key251" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key252" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key253" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key254" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key255" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key256" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key257" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key258" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key259" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key26" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key260" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key261" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key262" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key263" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key264" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key265" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key266" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key267" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key268" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key269" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key27" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key270" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key271" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key272" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key273" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key274" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key275" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key276" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key277" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key278" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key279" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key28" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key280" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key281" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key282" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key283" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key284" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key285" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key286" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key287" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key288" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key289" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key29" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key290" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key291" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key292" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key293" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key294" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key295" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key296" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key297" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key298" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key299" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key3" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key30" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key300" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key301" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key302" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key303" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key304" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key305" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key306" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key307" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key308" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key309" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key31" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key310" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key311" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key312" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key313" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key314" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key315" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key316" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key317" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key318" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key319" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key32" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key320" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key321" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key322" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key323" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key324" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key325" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key326" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key327" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key328" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key329" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key33" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key330" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key331" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key332" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key333" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key334" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key335" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key336" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key337" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key338" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key339" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key34" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key340" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key341" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key342" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key343" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key344" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key345" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key346" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key347" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key348" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key349" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key35" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key350" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key351" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key352" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key353" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key354" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key355" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key356" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key357" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key358" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key359" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key36" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key360" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key361" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key362" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key363" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key364" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key365" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key366" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key367" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key368" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key369" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key37" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key370" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key371" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key372" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key373" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key374" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key375" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key376" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key377" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key378" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key379" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key38" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key380" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key381" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key382" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key383" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key384" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key385" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key386" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key387" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key388" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key389" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key39" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key390" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key391" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key392" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key393" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key394" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key395" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key396" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key4" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key40" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key41" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key42" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key43" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key44" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key45" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key46" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key47" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key48" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key49" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key5" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key50" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key51" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key52" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key53" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key54" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key55" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key56" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key57" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key58" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key59" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key6" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key60" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key61" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key62" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key63" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key64" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key65" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key66" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key67" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key68" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key69" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key7" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key70" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key71" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key72" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key73" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key74" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key75" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key76" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key77" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key78" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key79" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key8" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key80" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key81" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key82" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key83" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key84" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key85" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key86" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key87" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key88" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key89" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key9" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key90" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key91" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key92" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key93" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key94" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key95" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key96" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key97" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key98" UNIQUE ("requestNumber");


--
-- Name: ReorderRequests ReorderRequests_requestNumber_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_requestNumber_key99" UNIQUE ("requestNumber");


--
-- Name: RequestForQuotations RequestForQuotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_pkey" PRIMARY KEY (id);


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key1" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key10" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key11" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key12" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key13" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key14" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key15" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key16" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key17" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key18" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key19" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key2" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key20" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key21" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key22" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key23" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key24" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key25" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key26" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key27" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key28" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key29" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key3" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key30" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key31" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key32" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key4" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key5" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key6" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key7" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key8" UNIQUE ("rfqNumber");


--
-- Name: RequestForQuotations RequestForQuotations_rfqNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_rfqNumber_key9" UNIQUE ("rfqNumber");


--
-- Name: RfqItems RfqItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqItems"
    ADD CONSTRAINT "RfqItems_pkey" PRIMARY KEY (id);


--
-- Name: RfqQuoteItems RfqQuoteItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqQuoteItems"
    ADD CONSTRAINT "RfqQuoteItems_pkey" PRIMARY KEY (id);


--
-- Name: RfqSuppliers RfqSuppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqSuppliers"
    ADD CONSTRAINT "RfqSuppliers_pkey" PRIMARY KEY (id);


--
-- Name: RfqSuppliers RfqSuppliers_responseToken_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqSuppliers"
    ADD CONSTRAINT "RfqSuppliers_responseToken_key" UNIQUE ("responseToken");


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: StorageLocations StorageLocations_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key1" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key10" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key100" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key101" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key102" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key103" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key104" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key105" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key106" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key107" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key108" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key109" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key11" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key110" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key111" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key112" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key113" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key114" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key115" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key116" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key117" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key118" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key119" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key12" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key120" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key121" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key122" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key123" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key124" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key125" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key126" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key127" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key128" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key129" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key13" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key130" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key131" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key132" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key133" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key134" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key135" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key136" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key137" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key138" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key139" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key14" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key140" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key141" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key142" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key143" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key144" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key145" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key146" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key147" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key148" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key149" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key15" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key150" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key151" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key152" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key153" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key154" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key155" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key156" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key157" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key158" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key159" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key16" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key160" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key161" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key162" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key163" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key164" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key165" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key166" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key167" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key168" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key169" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key17" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key170" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key171" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key172" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key173" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key174" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key175" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key176" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key177" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key178" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key179" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key18" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key180" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key181" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key182" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key183" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key184" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key185" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key186" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key187" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key188" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key189" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key19" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key190" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key191" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key192" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key193" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key194" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key195" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key196" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key197" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key198" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key199" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key2" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key20" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key200" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key201" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key202" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key203" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key204" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key205" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key206" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key207" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key208" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key209" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key21" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key210" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key211" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key212" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key213" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key214" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key215" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key216" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key217" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key218" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key219" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key22" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key220" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key221" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key222" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key223" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key224" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key225" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key226" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key227" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key228" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key229" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key23" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key230" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key231" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key232" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key233" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key234" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key235" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key236" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key237" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key238" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key239" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key24" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key240" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key241" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key242" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key243" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key244" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key245" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key246" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key247" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key248" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key249" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key25" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key250" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key251" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key252" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key253" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key254" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key255" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key256" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key257" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key258" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key259" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key26" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key260" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key261" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key262" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key263" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key264" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key265" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key266" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key267" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key268" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key269" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key27" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key270" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key271" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key272" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key273" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key274" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key275" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key276" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key277" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key278" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key279" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key28" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key280" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key281" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key282" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key283" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key284" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key285" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key286" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key287" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key288" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key289" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key29" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key290" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key291" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key292" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key293" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key294" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key295" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key296" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key297" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key298" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key299" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key3" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key30" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key300" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key301" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key302" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key303" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key304" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key305" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key306" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key307" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key308" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key309" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key31" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key310" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key311" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key312" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key313" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key314" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key315" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key316" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key317" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key318" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key319" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key32" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key320" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key321" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key322" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key323" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key324" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key325" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key326" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key327" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key328" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key329" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key33" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key330" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key331" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key332" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key333" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key334" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key335" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key336" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key337" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key338" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key339" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key34" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key340" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key341" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key342" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key343" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key344" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key345" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key346" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key347" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key348" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key349" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key35" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key350" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key351" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key352" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key353" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key354" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key355" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key356" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key357" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key358" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key359" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key36" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key360" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key361" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key362" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key363" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key364" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key365" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key366" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key367" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key368" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key369" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key37" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key370" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key371" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key372" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key373" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key374" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key375" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key376" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key377" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key378" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key379" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key38" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key380" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key381" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key382" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key383" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key384" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key385" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key386" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key387" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key388" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key389" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key39" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key390" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key391" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key392" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key393" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key394" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key395" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key396" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key397; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key397" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key398; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key398" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key399; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key399" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key4" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key40" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key400; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key400" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key401; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key401" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key402; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key402" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key403; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key403" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key404; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key404" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key405; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key405" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key406" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key407; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key407" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key408; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key408" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key409; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key409" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key41" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key410" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key411; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key411" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key412" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key413; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key413" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key414; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key414" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key415" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key416; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key416" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key417; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key417" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key418; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key418" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key419; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key419" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key42" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key420; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key420" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key421; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key421" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key422; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key422" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key423; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key423" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key424; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key424" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key425; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key425" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key426; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key426" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key427; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key427" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key428; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key428" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key429" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key43" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key430; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key430" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key431; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key431" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key432; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key432" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key433" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key434; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key434" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key435; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key435" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key436; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key436" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key437; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key437" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key438; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key438" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key439" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key44" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key440; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key440" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key441; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key441" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key442; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key442" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key443; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key443" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key444; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key444" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key445; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key445" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key446; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key446" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key447; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key447" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key448; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key448" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key449; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key449" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key45" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key450; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key450" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key451; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key451" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key452; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key452" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key453; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key453" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key454; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key454" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key455; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key455" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key456; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key456" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key457; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key457" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key458; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key458" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key459; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key459" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key46" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key460; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key460" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key461; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key461" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key462; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key462" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key463; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key463" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key464; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key464" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key465; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key465" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key466; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key466" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key467; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key467" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key468; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key468" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key47" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key48" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key49" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key5" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key50" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key51" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key52" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key53" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key54" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key55" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key56" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key57" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key58" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key59" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key6" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key60" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key61" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key62" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key63" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key64" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key65" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key66" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key67" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key68" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key69" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key7" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key70" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key71" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key72" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key73" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key74" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key75" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key76" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key77" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key78" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key79" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key8" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key80" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key81" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key82" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key83" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key84" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key85" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key86" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key87" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key88" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key89" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key9" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key90" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key91" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key92" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key93" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key94" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key95" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key96" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key97" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key98" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_code_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_code_key99" UNIQUE (code);


--
-- Name: StorageLocations StorageLocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_pkey" PRIMARY KEY (id);


--
-- Name: Suppliers Suppliers_acceptanceToken_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_acceptanceToken_key" UNIQUE ("acceptanceToken");


--
-- Name: Suppliers Suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_pkey" PRIMARY KEY (id);


--
-- Name: Suppliers Suppliers_supplierNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key1" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key10" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key11" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key12" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key13" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key14" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key15" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key16" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key17" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key18" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key19" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key2" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key20" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key21" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key22" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key23" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key24" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key25" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key26" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key27" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key28" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key29" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key3" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key30" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key31" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key32" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key4" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key5" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key6" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key7" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key8" UNIQUE ("supplierNumber");


--
-- Name: Suppliers Suppliers_supplierNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_supplierNumber_key9" UNIQUE ("supplierNumber");


--
-- Name: TransactionItems TransactionItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_transactionNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key1" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key10" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key100" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key101" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key102" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key103" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key104" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key105" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key106" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key107" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key108" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key109" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key11" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key110" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key111" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key112" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key113" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key114" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key115" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key116" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key117" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key118" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key119" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key12" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key120" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key121" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key122" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key123" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key124" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key125" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key126" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key127" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key128" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key129" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key13" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key130" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key131" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key132" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key133" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key134" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key135" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key136" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key137" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key138" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key139" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key14" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key140" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key141" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key142" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key143" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key144" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key145" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key146" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key147" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key148" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key149" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key15" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key150" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key151" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key152" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key153" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key154" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key155" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key156" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key157" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key158" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key159" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key16" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key160" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key161" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key162" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key163" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key164" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key165" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key166" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key167" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key168" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key169" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key17" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key170" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key171" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key172" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key173" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key174" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key175" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key176" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key177" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key178" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key179" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key18" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key180" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key181" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key182" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key183" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key184" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key185" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key186" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key187" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key188" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key189" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key19" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key190" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key191" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key192" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key193" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key194" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key195" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key196" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key197" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key198" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key199" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key2" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key20" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key200" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key201" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key202" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key203" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key204" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key205" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key206" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key207" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key208" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key209" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key21" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key210" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key211" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key212" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key213" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key214" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key215" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key216" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key217" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key218" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key219" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key22" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key220" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key221" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key222" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key223" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key224" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key225" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key226" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key227" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key228" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key229" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key23" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key230" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key231" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key232" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key233" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key234" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key235" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key236" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key237" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key238" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key239" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key24" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key240" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key241" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key242" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key243" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key244" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key245" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key246" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key247" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key248" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key249" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key25" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key250" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key251" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key252" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key253" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key254" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key255" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key256" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key257" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key258" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key259" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key26" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key260" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key261" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key262" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key263" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key264" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key265" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key266" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key267" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key268" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key269" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key27" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key270" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key271" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key272" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key273" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key274" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key275" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key276" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key277" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key278" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key279" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key28" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key280" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key281" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key282" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key283" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key284" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key285" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key286" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key287" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key288" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key289" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key29" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key290" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key291" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key292" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key293" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key294" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key295" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key296" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key297" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key298" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key299" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key3" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key30" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key300" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key301" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key302" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key303" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key304" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key305" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key306" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key307" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key308" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key309" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key31" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key310" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key311" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key312" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key313" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key314" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key315" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key316" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key317" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key318" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key319" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key32" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key320" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key321" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key322" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key323" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key324" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key325" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key326" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key327" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key328" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key329" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key33" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key330" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key331" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key332" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key333" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key334" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key335" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key336" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key337" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key338" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key339" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key34" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key340" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key341" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key342" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key343" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key344" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key345" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key346" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key347" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key348" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key349" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key35" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key350" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key351" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key352" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key353" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key354" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key355" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key356" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key357" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key358" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key359" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key36" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key360" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key361" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key362" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key363" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key364" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key365" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key366" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key367" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key368" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key369" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key37" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key370" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key371" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key372" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key373" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key374" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key375" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key376" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key377" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key378" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key379" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key38" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key380" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key381" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key382" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key383" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key384" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key385" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key386" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key387" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key388" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key389" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key39" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key390" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key391" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key392" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key393" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key394" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key395" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key396" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key397; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key397" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key398; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key398" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key399; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key399" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key4" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key40" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key41" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key42" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key43" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key44" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key45" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key46" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key47" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key48" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key49" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key5" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key50" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key51" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key52" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key53" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key54" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key55" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key56" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key57" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key58" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key59" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key6" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key60" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key61" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key62" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key63" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key64" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key65" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key66" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key67" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key68" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key69" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key7" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key70" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key71" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key72" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key73" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key74" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key75" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key76" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key77" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key78" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key79" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key8" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key80" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key81" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key82" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key83" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key84" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key85" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key86" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key87" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key88" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key89" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key9" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key90" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key91" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key92" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key93" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key94" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key95" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key96" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key97" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key98" UNIQUE ("transactionNumber");


--
-- Name: Transactions Transactions_transactionNumber_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transactionNumber_key99" UNIQUE ("transactionNumber");


--
-- Name: UnspscBreakdowns UnspscBreakdowns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscBreakdowns"
    ADD CONSTRAINT "UnspscBreakdowns_pkey" PRIMARY KEY (id);


--
-- Name: UnspscBreakdowns UnspscBreakdowns_unspscCode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscBreakdowns"
    ADD CONSTRAINT "UnspscBreakdowns_unspscCode_key" UNIQUE ("unspscCode");


--
-- Name: UnspscCodes UnspscCodes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key1" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key10" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key100" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key101" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key102" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key103" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key104" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key105" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key106" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key107" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key108" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key109" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key11" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key110" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key111" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key112" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key113" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key114" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key115" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key116" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key117" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key118" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key119" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key12" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key120" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key121" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key122" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key123" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key124" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key125" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key126" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key127" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key128" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key129" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key13" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key130" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key131" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key132" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key133" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key134" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key135" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key136" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key137" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key138" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key139" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key14" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key140" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key141" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key142" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key143" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key144" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key145" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key146" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key147" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key148" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key149" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key15" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key150" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key151" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key152" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key153" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key154" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key155" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key156" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key157" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key158" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key159" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key16" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key160" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key161" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key162" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key163" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key164" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key165" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key166" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key167" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key168" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key169" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key17" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key170" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key171" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key172" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key173" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key174" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key175" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key176" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key177" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key178" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key179" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key18" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key180" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key181" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key182" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key183" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key184" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key185" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key186" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key187" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key188" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key189" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key19" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key190" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key191" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key192" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key193" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key194" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key195" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key196" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key197" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key198" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key199" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key2" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key20" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key200" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key201" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key202" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key203" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key204" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key205" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key206" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key207" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key208" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key209" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key21" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key210" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key211" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key212" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key213" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key214" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key215" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key216" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key217" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key218" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key219" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key22" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key220" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key221" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key222" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key223" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key224" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key225" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key226" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key227" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key228" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key229" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key23" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key230" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key231" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key232" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key233" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key234" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key235" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key236" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key237" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key238" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key239" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key24" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key240" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key241" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key242" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key243" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key244" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key245" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key246" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key247" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key248" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key249" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key25" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key250" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key251" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key252" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key253" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key254" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key255" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key256" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key257" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key258" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key259" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key26" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key260" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key261" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key262" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key263" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key264" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key265" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key266" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key267" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key268" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key269" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key27" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key270" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key271" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key272" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key273" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key274" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key275" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key276" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key277" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key278" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key279" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key28" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key280" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key281" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key282" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key283" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key284" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key285" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key286" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key287" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key288" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key289" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key29" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key290" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key291" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key292" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key293" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key294" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key295" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key296" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key297" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key298" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key299" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key3" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key30" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key300" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key301" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key302" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key303" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key304" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key305" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key306" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key307" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key308" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key309" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key31" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key310" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key311" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key312" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key313" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key314" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key315" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key316" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key317" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key318" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key319" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key32" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key320" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key321" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key322" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key323" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key324" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key325" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key326" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key327" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key328" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key329" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key33" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key330" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key331" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key332" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key333" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key334" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key335" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key336" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key337" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key338" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key339" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key34" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key340" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key341" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key342" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key343" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key344" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key345" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key346" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key347" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key348" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key349" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key35" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key350" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key351" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key352" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key353" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key354" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key355" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key356" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key357" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key358" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key359" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key36" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key360" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key361" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key362" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key363" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key364" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key365" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key366" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key367" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key368" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key369" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key37" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key370" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key371" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key372" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key373" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key374" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key375" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key376" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key377" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key378" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key379" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key38" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key380" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key381" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key382" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key383" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key384" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key385" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key386" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key387" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key388" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key389" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key39" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key390" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key391" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key392" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key393" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key394" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key395" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key396" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key397; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key397" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key398; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key398" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key399; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key399" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key4" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key40" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key400; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key400" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key401; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key401" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key402; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key402" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key403; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key403" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key404; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key404" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key405; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key405" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key406" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key407; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key407" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key408; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key408" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key409; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key409" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key41" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key410" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key411; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key411" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key412" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key413; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key413" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key414; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key414" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key415" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key416; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key416" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key417; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key417" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key418; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key418" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key419; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key419" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key42" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key420; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key420" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key421; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key421" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key422; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key422" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key423; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key423" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key424; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key424" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key425; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key425" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key426; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key426" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key427; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key427" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key428; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key428" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key429" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key43" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key430; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key430" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key431; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key431" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key432; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key432" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key433" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key434; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key434" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key435; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key435" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key436; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key436" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key437; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key437" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key438; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key438" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key439" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key44" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key440; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key440" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key441; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key441" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key442; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key442" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key443; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key443" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key444; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key444" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key445; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key445" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key446; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key446" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key447; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key447" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key448; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key448" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key449; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key449" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key45" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key450; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key450" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key451; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key451" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key452; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key452" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key453; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key453" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key454; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key454" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key455; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key455" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key456; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key456" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key457; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key457" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key458; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key458" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key459; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key459" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key46" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key460; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key460" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key461; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key461" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key462; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key462" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key463; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key463" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key464; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key464" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key465; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key465" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key466; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key466" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key467; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key467" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key468; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key468" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key469; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key469" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key47" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key470; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key470" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key471; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key471" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key472; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key472" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key473; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key473" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key474; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key474" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key475; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key475" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key476; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key476" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key48" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key49" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key5" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key50" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key51" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key52" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key53" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key54" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key55" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key56" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key57" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key58" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key59" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key6" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key60" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key61" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key62" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key63" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key64" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key65" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key66" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key67" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key68" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key69" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key7" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key70" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key71" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key72" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key73" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key74" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key75" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key76" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key77" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key78" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key79" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key8" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key80" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key81" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key82" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key83" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key84" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key85" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key86" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key87" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key88" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key89" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key9" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key90" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key91" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key92" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key93" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key94" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key95" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key96" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key97" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key98" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_code_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_code_key99" UNIQUE (code);


--
-- Name: UnspscCodes UnspscCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnspscCodes"
    ADD CONSTRAINT "UnspscCodes_pkey" PRIMARY KEY (id);


--
-- Name: UserUnspscFavorites UserUnspscFavorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserUnspscFavorites"
    ADD CONSTRAINT "UserUnspscFavorites_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key1" UNIQUE (email);


--
-- Name: Users Users_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key10" UNIQUE (email);


--
-- Name: Users Users_email_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key100" UNIQUE (email);


--
-- Name: Users Users_email_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key101" UNIQUE (email);


--
-- Name: Users Users_email_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key102" UNIQUE (email);


--
-- Name: Users Users_email_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key103" UNIQUE (email);


--
-- Name: Users Users_email_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key104" UNIQUE (email);


--
-- Name: Users Users_email_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key105" UNIQUE (email);


--
-- Name: Users Users_email_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key106" UNIQUE (email);


--
-- Name: Users Users_email_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key107" UNIQUE (email);


--
-- Name: Users Users_email_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key108" UNIQUE (email);


--
-- Name: Users Users_email_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key109" UNIQUE (email);


--
-- Name: Users Users_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key11" UNIQUE (email);


--
-- Name: Users Users_email_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key110" UNIQUE (email);


--
-- Name: Users Users_email_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key111" UNIQUE (email);


--
-- Name: Users Users_email_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key112" UNIQUE (email);


--
-- Name: Users Users_email_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key113" UNIQUE (email);


--
-- Name: Users Users_email_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key114" UNIQUE (email);


--
-- Name: Users Users_email_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key115" UNIQUE (email);


--
-- Name: Users Users_email_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key116" UNIQUE (email);


--
-- Name: Users Users_email_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key117" UNIQUE (email);


--
-- Name: Users Users_email_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key118" UNIQUE (email);


--
-- Name: Users Users_email_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key119" UNIQUE (email);


--
-- Name: Users Users_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key12" UNIQUE (email);


--
-- Name: Users Users_email_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key120" UNIQUE (email);


--
-- Name: Users Users_email_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key121" UNIQUE (email);


--
-- Name: Users Users_email_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key122" UNIQUE (email);


--
-- Name: Users Users_email_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key123" UNIQUE (email);


--
-- Name: Users Users_email_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key124" UNIQUE (email);


--
-- Name: Users Users_email_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key125" UNIQUE (email);


--
-- Name: Users Users_email_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key126" UNIQUE (email);


--
-- Name: Users Users_email_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key127" UNIQUE (email);


--
-- Name: Users Users_email_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key128" UNIQUE (email);


--
-- Name: Users Users_email_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key129" UNIQUE (email);


--
-- Name: Users Users_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key13" UNIQUE (email);


--
-- Name: Users Users_email_key130; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key130" UNIQUE (email);


--
-- Name: Users Users_email_key131; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key131" UNIQUE (email);


--
-- Name: Users Users_email_key132; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key132" UNIQUE (email);


--
-- Name: Users Users_email_key133; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key133" UNIQUE (email);


--
-- Name: Users Users_email_key134; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key134" UNIQUE (email);


--
-- Name: Users Users_email_key135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key135" UNIQUE (email);


--
-- Name: Users Users_email_key136; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key136" UNIQUE (email);


--
-- Name: Users Users_email_key137; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key137" UNIQUE (email);


--
-- Name: Users Users_email_key138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key138" UNIQUE (email);


--
-- Name: Users Users_email_key139; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key139" UNIQUE (email);


--
-- Name: Users Users_email_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key14" UNIQUE (email);


--
-- Name: Users Users_email_key140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key140" UNIQUE (email);


--
-- Name: Users Users_email_key141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key141" UNIQUE (email);


--
-- Name: Users Users_email_key142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key142" UNIQUE (email);


--
-- Name: Users Users_email_key143; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key143" UNIQUE (email);


--
-- Name: Users Users_email_key144; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key144" UNIQUE (email);


--
-- Name: Users Users_email_key145; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key145" UNIQUE (email);


--
-- Name: Users Users_email_key146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key146" UNIQUE (email);


--
-- Name: Users Users_email_key147; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key147" UNIQUE (email);


--
-- Name: Users Users_email_key148; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key148" UNIQUE (email);


--
-- Name: Users Users_email_key149; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key149" UNIQUE (email);


--
-- Name: Users Users_email_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key15" UNIQUE (email);


--
-- Name: Users Users_email_key150; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key150" UNIQUE (email);


--
-- Name: Users Users_email_key151; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key151" UNIQUE (email);


--
-- Name: Users Users_email_key152; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key152" UNIQUE (email);


--
-- Name: Users Users_email_key153; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key153" UNIQUE (email);


--
-- Name: Users Users_email_key154; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key154" UNIQUE (email);


--
-- Name: Users Users_email_key155; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key155" UNIQUE (email);


--
-- Name: Users Users_email_key156; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key156" UNIQUE (email);


--
-- Name: Users Users_email_key157; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key157" UNIQUE (email);


--
-- Name: Users Users_email_key158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key158" UNIQUE (email);


--
-- Name: Users Users_email_key159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key159" UNIQUE (email);


--
-- Name: Users Users_email_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key16" UNIQUE (email);


--
-- Name: Users Users_email_key160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key160" UNIQUE (email);


--
-- Name: Users Users_email_key161; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key161" UNIQUE (email);


--
-- Name: Users Users_email_key162; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key162" UNIQUE (email);


--
-- Name: Users Users_email_key163; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key163" UNIQUE (email);


--
-- Name: Users Users_email_key164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key164" UNIQUE (email);


--
-- Name: Users Users_email_key165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key165" UNIQUE (email);


--
-- Name: Users Users_email_key166; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key166" UNIQUE (email);


--
-- Name: Users Users_email_key167; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key167" UNIQUE (email);


--
-- Name: Users Users_email_key168; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key168" UNIQUE (email);


--
-- Name: Users Users_email_key169; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key169" UNIQUE (email);


--
-- Name: Users Users_email_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key17" UNIQUE (email);


--
-- Name: Users Users_email_key170; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key170" UNIQUE (email);


--
-- Name: Users Users_email_key171; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key171" UNIQUE (email);


--
-- Name: Users Users_email_key172; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key172" UNIQUE (email);


--
-- Name: Users Users_email_key173; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key173" UNIQUE (email);


--
-- Name: Users Users_email_key174; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key174" UNIQUE (email);


--
-- Name: Users Users_email_key175; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key175" UNIQUE (email);


--
-- Name: Users Users_email_key176; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key176" UNIQUE (email);


--
-- Name: Users Users_email_key177; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key177" UNIQUE (email);


--
-- Name: Users Users_email_key178; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key178" UNIQUE (email);


--
-- Name: Users Users_email_key179; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key179" UNIQUE (email);


--
-- Name: Users Users_email_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key18" UNIQUE (email);


--
-- Name: Users Users_email_key180; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key180" UNIQUE (email);


--
-- Name: Users Users_email_key181; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key181" UNIQUE (email);


--
-- Name: Users Users_email_key182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key182" UNIQUE (email);


--
-- Name: Users Users_email_key183; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key183" UNIQUE (email);


--
-- Name: Users Users_email_key184; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key184" UNIQUE (email);


--
-- Name: Users Users_email_key185; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key185" UNIQUE (email);


--
-- Name: Users Users_email_key186; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key186" UNIQUE (email);


--
-- Name: Users Users_email_key187; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key187" UNIQUE (email);


--
-- Name: Users Users_email_key188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key188" UNIQUE (email);


--
-- Name: Users Users_email_key189; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key189" UNIQUE (email);


--
-- Name: Users Users_email_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key19" UNIQUE (email);


--
-- Name: Users Users_email_key190; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key190" UNIQUE (email);


--
-- Name: Users Users_email_key191; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key191" UNIQUE (email);


--
-- Name: Users Users_email_key192; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key192" UNIQUE (email);


--
-- Name: Users Users_email_key193; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key193" UNIQUE (email);


--
-- Name: Users Users_email_key194; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key194" UNIQUE (email);


--
-- Name: Users Users_email_key195; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key195" UNIQUE (email);


--
-- Name: Users Users_email_key196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key196" UNIQUE (email);


--
-- Name: Users Users_email_key197; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key197" UNIQUE (email);


--
-- Name: Users Users_email_key198; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key198" UNIQUE (email);


--
-- Name: Users Users_email_key199; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key199" UNIQUE (email);


--
-- Name: Users Users_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key2" UNIQUE (email);


--
-- Name: Users Users_email_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key20" UNIQUE (email);


--
-- Name: Users Users_email_key200; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key200" UNIQUE (email);


--
-- Name: Users Users_email_key201; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key201" UNIQUE (email);


--
-- Name: Users Users_email_key202; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key202" UNIQUE (email);


--
-- Name: Users Users_email_key203; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key203" UNIQUE (email);


--
-- Name: Users Users_email_key204; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key204" UNIQUE (email);


--
-- Name: Users Users_email_key205; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key205" UNIQUE (email);


--
-- Name: Users Users_email_key206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key206" UNIQUE (email);


--
-- Name: Users Users_email_key207; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key207" UNIQUE (email);


--
-- Name: Users Users_email_key208; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key208" UNIQUE (email);


--
-- Name: Users Users_email_key209; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key209" UNIQUE (email);


--
-- Name: Users Users_email_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key21" UNIQUE (email);


--
-- Name: Users Users_email_key210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key210" UNIQUE (email);


--
-- Name: Users Users_email_key211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key211" UNIQUE (email);


--
-- Name: Users Users_email_key212; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key212" UNIQUE (email);


--
-- Name: Users Users_email_key213; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key213" UNIQUE (email);


--
-- Name: Users Users_email_key214; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key214" UNIQUE (email);


--
-- Name: Users Users_email_key215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key215" UNIQUE (email);


--
-- Name: Users Users_email_key216; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key216" UNIQUE (email);


--
-- Name: Users Users_email_key217; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key217" UNIQUE (email);


--
-- Name: Users Users_email_key218; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key218" UNIQUE (email);


--
-- Name: Users Users_email_key219; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key219" UNIQUE (email);


--
-- Name: Users Users_email_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key22" UNIQUE (email);


--
-- Name: Users Users_email_key220; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key220" UNIQUE (email);


--
-- Name: Users Users_email_key221; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key221" UNIQUE (email);


--
-- Name: Users Users_email_key222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key222" UNIQUE (email);


--
-- Name: Users Users_email_key223; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key223" UNIQUE (email);


--
-- Name: Users Users_email_key224; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key224" UNIQUE (email);


--
-- Name: Users Users_email_key225; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key225" UNIQUE (email);


--
-- Name: Users Users_email_key226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key226" UNIQUE (email);


--
-- Name: Users Users_email_key227; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key227" UNIQUE (email);


--
-- Name: Users Users_email_key228; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key228" UNIQUE (email);


--
-- Name: Users Users_email_key229; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key229" UNIQUE (email);


--
-- Name: Users Users_email_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key23" UNIQUE (email);


--
-- Name: Users Users_email_key230; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key230" UNIQUE (email);


--
-- Name: Users Users_email_key231; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key231" UNIQUE (email);


--
-- Name: Users Users_email_key232; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key232" UNIQUE (email);


--
-- Name: Users Users_email_key233; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key233" UNIQUE (email);


--
-- Name: Users Users_email_key234; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key234" UNIQUE (email);


--
-- Name: Users Users_email_key235; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key235" UNIQUE (email);


--
-- Name: Users Users_email_key236; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key236" UNIQUE (email);


--
-- Name: Users Users_email_key237; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key237" UNIQUE (email);


--
-- Name: Users Users_email_key238; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key238" UNIQUE (email);


--
-- Name: Users Users_email_key239; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key239" UNIQUE (email);


--
-- Name: Users Users_email_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key24" UNIQUE (email);


--
-- Name: Users Users_email_key240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key240" UNIQUE (email);


--
-- Name: Users Users_email_key241; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key241" UNIQUE (email);


--
-- Name: Users Users_email_key242; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key242" UNIQUE (email);


--
-- Name: Users Users_email_key243; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key243" UNIQUE (email);


--
-- Name: Users Users_email_key244; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key244" UNIQUE (email);


--
-- Name: Users Users_email_key245; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key245" UNIQUE (email);


--
-- Name: Users Users_email_key246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key246" UNIQUE (email);


--
-- Name: Users Users_email_key247; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key247" UNIQUE (email);


--
-- Name: Users Users_email_key248; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key248" UNIQUE (email);


--
-- Name: Users Users_email_key249; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key249" UNIQUE (email);


--
-- Name: Users Users_email_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key25" UNIQUE (email);


--
-- Name: Users Users_email_key250; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key250" UNIQUE (email);


--
-- Name: Users Users_email_key251; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key251" UNIQUE (email);


--
-- Name: Users Users_email_key252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key252" UNIQUE (email);


--
-- Name: Users Users_email_key253; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key253" UNIQUE (email);


--
-- Name: Users Users_email_key254; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key254" UNIQUE (email);


--
-- Name: Users Users_email_key255; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key255" UNIQUE (email);


--
-- Name: Users Users_email_key256; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key256" UNIQUE (email);


--
-- Name: Users Users_email_key257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key257" UNIQUE (email);


--
-- Name: Users Users_email_key258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key258" UNIQUE (email);


--
-- Name: Users Users_email_key259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key259" UNIQUE (email);


--
-- Name: Users Users_email_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key26" UNIQUE (email);


--
-- Name: Users Users_email_key260; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key260" UNIQUE (email);


--
-- Name: Users Users_email_key261; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key261" UNIQUE (email);


--
-- Name: Users Users_email_key262; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key262" UNIQUE (email);


--
-- Name: Users Users_email_key263; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key263" UNIQUE (email);


--
-- Name: Users Users_email_key264; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key264" UNIQUE (email);


--
-- Name: Users Users_email_key265; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key265" UNIQUE (email);


--
-- Name: Users Users_email_key266; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key266" UNIQUE (email);


--
-- Name: Users Users_email_key267; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key267" UNIQUE (email);


--
-- Name: Users Users_email_key268; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key268" UNIQUE (email);


--
-- Name: Users Users_email_key269; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key269" UNIQUE (email);


--
-- Name: Users Users_email_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key27" UNIQUE (email);


--
-- Name: Users Users_email_key270; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key270" UNIQUE (email);


--
-- Name: Users Users_email_key271; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key271" UNIQUE (email);


--
-- Name: Users Users_email_key272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key272" UNIQUE (email);


--
-- Name: Users Users_email_key273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key273" UNIQUE (email);


--
-- Name: Users Users_email_key274; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key274" UNIQUE (email);


--
-- Name: Users Users_email_key275; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key275" UNIQUE (email);


--
-- Name: Users Users_email_key276; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key276" UNIQUE (email);


--
-- Name: Users Users_email_key277; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key277" UNIQUE (email);


--
-- Name: Users Users_email_key278; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key278" UNIQUE (email);


--
-- Name: Users Users_email_key279; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key279" UNIQUE (email);


--
-- Name: Users Users_email_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key28" UNIQUE (email);


--
-- Name: Users Users_email_key280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key280" UNIQUE (email);


--
-- Name: Users Users_email_key281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key281" UNIQUE (email);


--
-- Name: Users Users_email_key282; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key282" UNIQUE (email);


--
-- Name: Users Users_email_key283; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key283" UNIQUE (email);


--
-- Name: Users Users_email_key284; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key284" UNIQUE (email);


--
-- Name: Users Users_email_key285; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key285" UNIQUE (email);


--
-- Name: Users Users_email_key286; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key286" UNIQUE (email);


--
-- Name: Users Users_email_key287; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key287" UNIQUE (email);


--
-- Name: Users Users_email_key288; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key288" UNIQUE (email);


--
-- Name: Users Users_email_key289; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key289" UNIQUE (email);


--
-- Name: Users Users_email_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key29" UNIQUE (email);


--
-- Name: Users Users_email_key290; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key290" UNIQUE (email);


--
-- Name: Users Users_email_key291; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key291" UNIQUE (email);


--
-- Name: Users Users_email_key292; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key292" UNIQUE (email);


--
-- Name: Users Users_email_key293; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key293" UNIQUE (email);


--
-- Name: Users Users_email_key294; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key294" UNIQUE (email);


--
-- Name: Users Users_email_key295; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key295" UNIQUE (email);


--
-- Name: Users Users_email_key296; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key296" UNIQUE (email);


--
-- Name: Users Users_email_key297; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key297" UNIQUE (email);


--
-- Name: Users Users_email_key298; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key298" UNIQUE (email);


--
-- Name: Users Users_email_key299; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key299" UNIQUE (email);


--
-- Name: Users Users_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key3" UNIQUE (email);


--
-- Name: Users Users_email_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key30" UNIQUE (email);


--
-- Name: Users Users_email_key300; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key300" UNIQUE (email);


--
-- Name: Users Users_email_key301; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key301" UNIQUE (email);


--
-- Name: Users Users_email_key302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key302" UNIQUE (email);


--
-- Name: Users Users_email_key303; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key303" UNIQUE (email);


--
-- Name: Users Users_email_key304; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key304" UNIQUE (email);


--
-- Name: Users Users_email_key305; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key305" UNIQUE (email);


--
-- Name: Users Users_email_key306; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key306" UNIQUE (email);


--
-- Name: Users Users_email_key307; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key307" UNIQUE (email);


--
-- Name: Users Users_email_key308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key308" UNIQUE (email);


--
-- Name: Users Users_email_key309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key309" UNIQUE (email);


--
-- Name: Users Users_email_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key31" UNIQUE (email);


--
-- Name: Users Users_email_key310; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key310" UNIQUE (email);


--
-- Name: Users Users_email_key311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key311" UNIQUE (email);


--
-- Name: Users Users_email_key312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key312" UNIQUE (email);


--
-- Name: Users Users_email_key313; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key313" UNIQUE (email);


--
-- Name: Users Users_email_key314; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key314" UNIQUE (email);


--
-- Name: Users Users_email_key315; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key315" UNIQUE (email);


--
-- Name: Users Users_email_key316; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key316" UNIQUE (email);


--
-- Name: Users Users_email_key317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key317" UNIQUE (email);


--
-- Name: Users Users_email_key318; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key318" UNIQUE (email);


--
-- Name: Users Users_email_key319; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key319" UNIQUE (email);


--
-- Name: Users Users_email_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key32" UNIQUE (email);


--
-- Name: Users Users_email_key320; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key320" UNIQUE (email);


--
-- Name: Users Users_email_key321; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key321" UNIQUE (email);


--
-- Name: Users Users_email_key322; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key322" UNIQUE (email);


--
-- Name: Users Users_email_key323; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key323" UNIQUE (email);


--
-- Name: Users Users_email_key324; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key324" UNIQUE (email);


--
-- Name: Users Users_email_key325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key325" UNIQUE (email);


--
-- Name: Users Users_email_key326; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key326" UNIQUE (email);


--
-- Name: Users Users_email_key327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key327" UNIQUE (email);


--
-- Name: Users Users_email_key328; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key328" UNIQUE (email);


--
-- Name: Users Users_email_key329; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key329" UNIQUE (email);


--
-- Name: Users Users_email_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key33" UNIQUE (email);


--
-- Name: Users Users_email_key330; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key330" UNIQUE (email);


--
-- Name: Users Users_email_key331; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key331" UNIQUE (email);


--
-- Name: Users Users_email_key332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key332" UNIQUE (email);


--
-- Name: Users Users_email_key333; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key333" UNIQUE (email);


--
-- Name: Users Users_email_key334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key334" UNIQUE (email);


--
-- Name: Users Users_email_key335; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key335" UNIQUE (email);


--
-- Name: Users Users_email_key336; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key336" UNIQUE (email);


--
-- Name: Users Users_email_key337; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key337" UNIQUE (email);


--
-- Name: Users Users_email_key338; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key338" UNIQUE (email);


--
-- Name: Users Users_email_key339; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key339" UNIQUE (email);


--
-- Name: Users Users_email_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key34" UNIQUE (email);


--
-- Name: Users Users_email_key340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key340" UNIQUE (email);


--
-- Name: Users Users_email_key341; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key341" UNIQUE (email);


--
-- Name: Users Users_email_key342; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key342" UNIQUE (email);


--
-- Name: Users Users_email_key343; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key343" UNIQUE (email);


--
-- Name: Users Users_email_key344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key344" UNIQUE (email);


--
-- Name: Users Users_email_key345; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key345" UNIQUE (email);


--
-- Name: Users Users_email_key346; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key346" UNIQUE (email);


--
-- Name: Users Users_email_key347; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key347" UNIQUE (email);


--
-- Name: Users Users_email_key348; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key348" UNIQUE (email);


--
-- Name: Users Users_email_key349; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key349" UNIQUE (email);


--
-- Name: Users Users_email_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key35" UNIQUE (email);


--
-- Name: Users Users_email_key350; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key350" UNIQUE (email);


--
-- Name: Users Users_email_key351; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key351" UNIQUE (email);


--
-- Name: Users Users_email_key352; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key352" UNIQUE (email);


--
-- Name: Users Users_email_key353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key353" UNIQUE (email);


--
-- Name: Users Users_email_key354; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key354" UNIQUE (email);


--
-- Name: Users Users_email_key355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key355" UNIQUE (email);


--
-- Name: Users Users_email_key356; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key356" UNIQUE (email);


--
-- Name: Users Users_email_key357; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key357" UNIQUE (email);


--
-- Name: Users Users_email_key358; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key358" UNIQUE (email);


--
-- Name: Users Users_email_key359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key359" UNIQUE (email);


--
-- Name: Users Users_email_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key36" UNIQUE (email);


--
-- Name: Users Users_email_key360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key360" UNIQUE (email);


--
-- Name: Users Users_email_key361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key361" UNIQUE (email);


--
-- Name: Users Users_email_key362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key362" UNIQUE (email);


--
-- Name: Users Users_email_key363; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key363" UNIQUE (email);


--
-- Name: Users Users_email_key364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key364" UNIQUE (email);


--
-- Name: Users Users_email_key365; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key365" UNIQUE (email);


--
-- Name: Users Users_email_key366; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key366" UNIQUE (email);


--
-- Name: Users Users_email_key367; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key367" UNIQUE (email);


--
-- Name: Users Users_email_key368; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key368" UNIQUE (email);


--
-- Name: Users Users_email_key369; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key369" UNIQUE (email);


--
-- Name: Users Users_email_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key37" UNIQUE (email);


--
-- Name: Users Users_email_key370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key370" UNIQUE (email);


--
-- Name: Users Users_email_key371; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key371" UNIQUE (email);


--
-- Name: Users Users_email_key372; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key372" UNIQUE (email);


--
-- Name: Users Users_email_key373; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key373" UNIQUE (email);


--
-- Name: Users Users_email_key374; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key374" UNIQUE (email);


--
-- Name: Users Users_email_key375; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key375" UNIQUE (email);


--
-- Name: Users Users_email_key376; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key376" UNIQUE (email);


--
-- Name: Users Users_email_key377; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key377" UNIQUE (email);


--
-- Name: Users Users_email_key378; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key378" UNIQUE (email);


--
-- Name: Users Users_email_key379; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key379" UNIQUE (email);


--
-- Name: Users Users_email_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key38" UNIQUE (email);


--
-- Name: Users Users_email_key380; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key380" UNIQUE (email);


--
-- Name: Users Users_email_key381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key381" UNIQUE (email);


--
-- Name: Users Users_email_key382; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key382" UNIQUE (email);


--
-- Name: Users Users_email_key383; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key383" UNIQUE (email);


--
-- Name: Users Users_email_key384; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key384" UNIQUE (email);


--
-- Name: Users Users_email_key385; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key385" UNIQUE (email);


--
-- Name: Users Users_email_key386; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key386" UNIQUE (email);


--
-- Name: Users Users_email_key387; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key387" UNIQUE (email);


--
-- Name: Users Users_email_key388; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key388" UNIQUE (email);


--
-- Name: Users Users_email_key389; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key389" UNIQUE (email);


--
-- Name: Users Users_email_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key39" UNIQUE (email);


--
-- Name: Users Users_email_key390; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key390" UNIQUE (email);


--
-- Name: Users Users_email_key391; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key391" UNIQUE (email);


--
-- Name: Users Users_email_key392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key392" UNIQUE (email);


--
-- Name: Users Users_email_key393; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key393" UNIQUE (email);


--
-- Name: Users Users_email_key394; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key394" UNIQUE (email);


--
-- Name: Users Users_email_key395; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key395" UNIQUE (email);


--
-- Name: Users Users_email_key396; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key396" UNIQUE (email);


--
-- Name: Users Users_email_key397; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key397" UNIQUE (email);


--
-- Name: Users Users_email_key398; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key398" UNIQUE (email);


--
-- Name: Users Users_email_key399; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key399" UNIQUE (email);


--
-- Name: Users Users_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key4" UNIQUE (email);


--
-- Name: Users Users_email_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key40" UNIQUE (email);


--
-- Name: Users Users_email_key400; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key400" UNIQUE (email);


--
-- Name: Users Users_email_key401; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key401" UNIQUE (email);


--
-- Name: Users Users_email_key402; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key402" UNIQUE (email);


--
-- Name: Users Users_email_key403; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key403" UNIQUE (email);


--
-- Name: Users Users_email_key404; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key404" UNIQUE (email);


--
-- Name: Users Users_email_key405; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key405" UNIQUE (email);


--
-- Name: Users Users_email_key406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key406" UNIQUE (email);


--
-- Name: Users Users_email_key407; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key407" UNIQUE (email);


--
-- Name: Users Users_email_key408; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key408" UNIQUE (email);


--
-- Name: Users Users_email_key409; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key409" UNIQUE (email);


--
-- Name: Users Users_email_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key41" UNIQUE (email);


--
-- Name: Users Users_email_key410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key410" UNIQUE (email);


--
-- Name: Users Users_email_key411; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key411" UNIQUE (email);


--
-- Name: Users Users_email_key412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key412" UNIQUE (email);


--
-- Name: Users Users_email_key413; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key413" UNIQUE (email);


--
-- Name: Users Users_email_key414; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key414" UNIQUE (email);


--
-- Name: Users Users_email_key415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key415" UNIQUE (email);


--
-- Name: Users Users_email_key416; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key416" UNIQUE (email);


--
-- Name: Users Users_email_key417; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key417" UNIQUE (email);


--
-- Name: Users Users_email_key418; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key418" UNIQUE (email);


--
-- Name: Users Users_email_key419; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key419" UNIQUE (email);


--
-- Name: Users Users_email_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key42" UNIQUE (email);


--
-- Name: Users Users_email_key420; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key420" UNIQUE (email);


--
-- Name: Users Users_email_key421; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key421" UNIQUE (email);


--
-- Name: Users Users_email_key422; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key422" UNIQUE (email);


--
-- Name: Users Users_email_key423; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key423" UNIQUE (email);


--
-- Name: Users Users_email_key424; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key424" UNIQUE (email);


--
-- Name: Users Users_email_key425; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key425" UNIQUE (email);


--
-- Name: Users Users_email_key426; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key426" UNIQUE (email);


--
-- Name: Users Users_email_key427; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key427" UNIQUE (email);


--
-- Name: Users Users_email_key428; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key428" UNIQUE (email);


--
-- Name: Users Users_email_key429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key429" UNIQUE (email);


--
-- Name: Users Users_email_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key43" UNIQUE (email);


--
-- Name: Users Users_email_key430; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key430" UNIQUE (email);


--
-- Name: Users Users_email_key431; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key431" UNIQUE (email);


--
-- Name: Users Users_email_key432; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key432" UNIQUE (email);


--
-- Name: Users Users_email_key433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key433" UNIQUE (email);


--
-- Name: Users Users_email_key434; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key434" UNIQUE (email);


--
-- Name: Users Users_email_key435; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key435" UNIQUE (email);


--
-- Name: Users Users_email_key436; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key436" UNIQUE (email);


--
-- Name: Users Users_email_key437; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key437" UNIQUE (email);


--
-- Name: Users Users_email_key438; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key438" UNIQUE (email);


--
-- Name: Users Users_email_key439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key439" UNIQUE (email);


--
-- Name: Users Users_email_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key44" UNIQUE (email);


--
-- Name: Users Users_email_key440; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key440" UNIQUE (email);


--
-- Name: Users Users_email_key441; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key441" UNIQUE (email);


--
-- Name: Users Users_email_key442; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key442" UNIQUE (email);


--
-- Name: Users Users_email_key443; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key443" UNIQUE (email);


--
-- Name: Users Users_email_key444; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key444" UNIQUE (email);


--
-- Name: Users Users_email_key445; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key445" UNIQUE (email);


--
-- Name: Users Users_email_key446; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key446" UNIQUE (email);


--
-- Name: Users Users_email_key447; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key447" UNIQUE (email);


--
-- Name: Users Users_email_key448; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key448" UNIQUE (email);


--
-- Name: Users Users_email_key449; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key449" UNIQUE (email);


--
-- Name: Users Users_email_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key45" UNIQUE (email);


--
-- Name: Users Users_email_key450; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key450" UNIQUE (email);


--
-- Name: Users Users_email_key451; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key451" UNIQUE (email);


--
-- Name: Users Users_email_key452; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key452" UNIQUE (email);


--
-- Name: Users Users_email_key453; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key453" UNIQUE (email);


--
-- Name: Users Users_email_key454; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key454" UNIQUE (email);


--
-- Name: Users Users_email_key455; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key455" UNIQUE (email);


--
-- Name: Users Users_email_key456; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key456" UNIQUE (email);


--
-- Name: Users Users_email_key457; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key457" UNIQUE (email);


--
-- Name: Users Users_email_key458; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key458" UNIQUE (email);


--
-- Name: Users Users_email_key459; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key459" UNIQUE (email);


--
-- Name: Users Users_email_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key46" UNIQUE (email);


--
-- Name: Users Users_email_key460; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key460" UNIQUE (email);


--
-- Name: Users Users_email_key461; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key461" UNIQUE (email);


--
-- Name: Users Users_email_key462; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key462" UNIQUE (email);


--
-- Name: Users Users_email_key463; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key463" UNIQUE (email);


--
-- Name: Users Users_email_key464; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key464" UNIQUE (email);


--
-- Name: Users Users_email_key465; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key465" UNIQUE (email);


--
-- Name: Users Users_email_key466; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key466" UNIQUE (email);


--
-- Name: Users Users_email_key467; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key467" UNIQUE (email);


--
-- Name: Users Users_email_key468; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key468" UNIQUE (email);


--
-- Name: Users Users_email_key469; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key469" UNIQUE (email);


--
-- Name: Users Users_email_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key47" UNIQUE (email);


--
-- Name: Users Users_email_key470; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key470" UNIQUE (email);


--
-- Name: Users Users_email_key471; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key471" UNIQUE (email);


--
-- Name: Users Users_email_key472; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key472" UNIQUE (email);


--
-- Name: Users Users_email_key473; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key473" UNIQUE (email);


--
-- Name: Users Users_email_key474; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key474" UNIQUE (email);


--
-- Name: Users Users_email_key475; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key475" UNIQUE (email);


--
-- Name: Users Users_email_key476; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key476" UNIQUE (email);


--
-- Name: Users Users_email_key477; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key477" UNIQUE (email);


--
-- Name: Users Users_email_key478; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key478" UNIQUE (email);


--
-- Name: Users Users_email_key479; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key479" UNIQUE (email);


--
-- Name: Users Users_email_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key48" UNIQUE (email);


--
-- Name: Users Users_email_key480; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key480" UNIQUE (email);


--
-- Name: Users Users_email_key481; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key481" UNIQUE (email);


--
-- Name: Users Users_email_key482; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key482" UNIQUE (email);


--
-- Name: Users Users_email_key483; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key483" UNIQUE (email);


--
-- Name: Users Users_email_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key49" UNIQUE (email);


--
-- Name: Users Users_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key5" UNIQUE (email);


--
-- Name: Users Users_email_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key50" UNIQUE (email);


--
-- Name: Users Users_email_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key51" UNIQUE (email);


--
-- Name: Users Users_email_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key52" UNIQUE (email);


--
-- Name: Users Users_email_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key53" UNIQUE (email);


--
-- Name: Users Users_email_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key54" UNIQUE (email);


--
-- Name: Users Users_email_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key55" UNIQUE (email);


--
-- Name: Users Users_email_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key56" UNIQUE (email);


--
-- Name: Users Users_email_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key57" UNIQUE (email);


--
-- Name: Users Users_email_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key58" UNIQUE (email);


--
-- Name: Users Users_email_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key59" UNIQUE (email);


--
-- Name: Users Users_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key6" UNIQUE (email);


--
-- Name: Users Users_email_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key60" UNIQUE (email);


--
-- Name: Users Users_email_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key61" UNIQUE (email);


--
-- Name: Users Users_email_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key62" UNIQUE (email);


--
-- Name: Users Users_email_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key63" UNIQUE (email);


--
-- Name: Users Users_email_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key64" UNIQUE (email);


--
-- Name: Users Users_email_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key65" UNIQUE (email);


--
-- Name: Users Users_email_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key66" UNIQUE (email);


--
-- Name: Users Users_email_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key67" UNIQUE (email);


--
-- Name: Users Users_email_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key68" UNIQUE (email);


--
-- Name: Users Users_email_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key69" UNIQUE (email);


--
-- Name: Users Users_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key7" UNIQUE (email);


--
-- Name: Users Users_email_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key70" UNIQUE (email);


--
-- Name: Users Users_email_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key71" UNIQUE (email);


--
-- Name: Users Users_email_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key72" UNIQUE (email);


--
-- Name: Users Users_email_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key73" UNIQUE (email);


--
-- Name: Users Users_email_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key74" UNIQUE (email);


--
-- Name: Users Users_email_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key75" UNIQUE (email);


--
-- Name: Users Users_email_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key76" UNIQUE (email);


--
-- Name: Users Users_email_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key77" UNIQUE (email);


--
-- Name: Users Users_email_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key78" UNIQUE (email);


--
-- Name: Users Users_email_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key79" UNIQUE (email);


--
-- Name: Users Users_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key8" UNIQUE (email);


--
-- Name: Users Users_email_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key80" UNIQUE (email);


--
-- Name: Users Users_email_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key81" UNIQUE (email);


--
-- Name: Users Users_email_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key82" UNIQUE (email);


--
-- Name: Users Users_email_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key83" UNIQUE (email);


--
-- Name: Users Users_email_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key84" UNIQUE (email);


--
-- Name: Users Users_email_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key85" UNIQUE (email);


--
-- Name: Users Users_email_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key86" UNIQUE (email);


--
-- Name: Users Users_email_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key87" UNIQUE (email);


--
-- Name: Users Users_email_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key88" UNIQUE (email);


--
-- Name: Users Users_email_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key89" UNIQUE (email);


--
-- Name: Users Users_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key9" UNIQUE (email);


--
-- Name: Users Users_email_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key90" UNIQUE (email);


--
-- Name: Users Users_email_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key91" UNIQUE (email);


--
-- Name: Users Users_email_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key92" UNIQUE (email);


--
-- Name: Users Users_email_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key93" UNIQUE (email);


--
-- Name: Users Users_email_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key94" UNIQUE (email);


--
-- Name: Users Users_email_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key95" UNIQUE (email);


--
-- Name: Users Users_email_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key96" UNIQUE (email);


--
-- Name: Users Users_email_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key97" UNIQUE (email);


--
-- Name: Users Users_email_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key98" UNIQUE (email);


--
-- Name: Users Users_email_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key99" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Warehouses Warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Warehouses"
    ADD CONSTRAINT "Warehouses_pkey" PRIMARY KEY (id);


--
-- Name: unspsc_codes unspsc_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unspsc_codes
    ADD CONSTRAINT unspsc_codes_code_key UNIQUE (code);


--
-- Name: unspsc_codes unspsc_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unspsc_codes
    ADD CONSTRAINT unspsc_codes_pkey PRIMARY KEY (id);


--
-- Name: user_unspsc_favorites user_unspsc_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_unspsc_favorites
    ADD CONSTRAINT user_unspsc_favorites_pkey PRIMARY KEY (id);


--
-- Name: user_unspsc_hierarchy user_unspsc_hierarchy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_unspsc_hierarchy
    ADD CONSTRAINT user_unspsc_hierarchy_pkey PRIMARY KEY (id);


--
-- Name: bin_locations_bin_code_storage_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bin_locations_bin_code_storage_location_id ON public."BinLocations" USING btree ("binCode", "storageLocationId");


--
-- Name: contract_items_contract_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_items_contract_id_idx ON public."ContractItems" USING btree ("contractId");


--
-- Name: contract_items_item_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_items_item_number_idx ON public."ContractItems" USING btree ("itemNumber");


--
-- Name: contracts_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_end_date_idx ON public."Contracts" USING btree ("endDate");


--
-- Name: contracts_start_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_start_date_idx ON public."Contracts" USING btree ("startDate");


--
-- Name: contracts_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_status_idx ON public."Contracts" USING btree (status);


--
-- Name: contracts_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_supplier_id_idx ON public."Contracts" USING btree ("supplierId");


--
-- Name: idx_UserUnspscFavorites_unspscCode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_UserUnspscFavorites_unspscCode" ON public."UserUnspscFavorites" USING btree ("unspscCode");


--
-- Name: idx_UserUnspscFavorites_userId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_UserUnspscFavorites_userId" ON public."UserUnspscFavorites" USING btree ("userId");


--
-- Name: idx_notifications_action_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_action_at ON public."Notifications" USING btree ("actionAt" DESC);


--
-- Name: idx_notifications_action_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_action_by ON public."Notifications" USING btree ("actionById");


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public."Notifications" USING btree ("isRead");


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public."Notifications" USING btree ("notificationType");


--
-- Name: idx_purchase_requisitions_contract_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_requisitions_contract_id ON public."PurchaseRequisitions" USING btree ("contractId");


--
-- Name: idx_rejection_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rejection_notifications_is_read ON public."RejectionNotifications" USING btree ("isRead");


--
-- Name: idx_rejection_notifications_rejected_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rejection_notifications_rejected_at ON public."RejectionNotifications" USING btree ("rejectedAt");


--
-- Name: idx_suppliers_acceptance_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_suppliers_acceptance_token ON public."Suppliers" USING btree ("acceptanceToken");


--
-- Name: idx_suppliers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_suppliers_status ON public."Suppliers" USING btree (status);


--
-- Name: idx_unspsc_breakdowns_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unspsc_breakdowns_code ON public."UnspscBreakdowns" USING btree ("unspscCode");


--
-- Name: idx_unspsc_breakdowns_valid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unspsc_breakdowns_valid ON public."UnspscBreakdowns" USING btree ("isValid");


--
-- Name: idx_unspsc_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unspsc_code ON public."UnspscBreakdowns" USING btree ("unspscCode");


--
-- Name: idx_unspsc_segment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unspsc_segment ON public."UnspscBreakdowns" USING btree ("segmentCode");


--
-- Name: idx_unspsc_valid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unspsc_valid ON public."UnspscBreakdowns" USING btree ("isValid");


--
-- Name: unspsc_codes_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX unspsc_codes_class ON public."UnspscCodes" USING btree (class);


--
-- Name: unspsc_codes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unspsc_codes_code ON public."UnspscCodes" USING btree (code);


--
-- Name: unspsc_codes_commodity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX unspsc_codes_commodity ON public."UnspscCodes" USING btree (commodity);


--
-- Name: unspsc_codes_family; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX unspsc_codes_family ON public."UnspscCodes" USING btree (family);


--
-- Name: unspsc_codes_segment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX unspsc_codes_segment ON public."UnspscCodes" USING btree (segment);


--
-- Name: user_unspsc_hierarchy_user_id_unspsc_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_unspsc_hierarchy_user_id_unspsc_code ON public.user_unspsc_hierarchy USING btree ("userId", "unspscCode");


--
-- Name: ContractItems update_contract_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_contract_items_updated_at BEFORE UPDATE ON public."ContractItems" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Contracts update_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public."Contracts" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Users user_name_sync_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER user_name_sync_trigger BEFORE INSERT OR UPDATE ON public."Users" FOR EACH ROW EXECUTE FUNCTION public.sync_user_name_columns();


--
-- Name: ApprovalHistories ApprovalHistories_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ApprovalHistories"
    ADD CONSTRAINT "ApprovalHistories_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: BinLocations BinLocations_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BinLocations"
    ADD CONSTRAINT "BinLocations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BinLocations BinLocations_storageLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BinLocations"
    ADD CONSTRAINT "BinLocations_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES public."StorageLocations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractItems ContractItems_ContractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContractItems"
    ADD CONSTRAINT "ContractItems_ContractId_fkey" FOREIGN KEY ("ContractId") REFERENCES public."Contracts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractItems ContractItems_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContractItems"
    ADD CONSTRAINT "ContractItems_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public."Contracts"(id) ON UPDATE CASCADE;


--
-- Name: ContractItems ContractItems_itemNumber_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContractItems"
    ADD CONSTRAINT "ContractItems_itemNumber_fkey" FOREIGN KEY ("itemNumber") REFERENCES public."ItemMasters"("itemNumber") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Contracts Contracts_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Contracts Contracts_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Suppliers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Contracts Contracts_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contracts"
    ADD CONSTRAINT "Contracts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: DelegationOfAuthorities DelegationOfAuthorities_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DelegationOfAuthorities"
    ADD CONSTRAINT "DelegationOfAuthorities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: DelegationOfAuthorities DelegationOfAuthorities_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DelegationOfAuthorities"
    ADD CONSTRAINT "DelegationOfAuthorities_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: DelegationOfAuthorities DelegationOfAuthorities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DelegationOfAuthorities"
    ADD CONSTRAINT "DelegationOfAuthorities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Inventories Inventories_binLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_binLocationId_fkey" FOREIGN KEY ("binLocationId") REFERENCES public."BinLocations"(id) ON UPDATE CASCADE;


--
-- Name: Inventories Inventories_itemMasterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_itemMasterId_fkey" FOREIGN KEY ("itemMasterId") REFERENCES public."ItemMasters"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Inventories Inventories_lastUpdatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Inventories Inventories_storageLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES public."StorageLocations"(id) ON UPDATE CASCADE;


--
-- Name: ItemMasters ItemMasters_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."Users"(id);


--
-- Name: ItemMasters ItemMasters_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id);


--
-- Name: ItemMasters ItemMasters_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."Users"(id);


--
-- Name: ItemMasters ItemMasters_unspscCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_unspscCodeId_fkey" FOREIGN KEY ("unspscCodeId") REFERENCES public."UnspscCodes"(id);


--
-- Name: ItemMasters ItemMasters_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemMasters"
    ADD CONSTRAINT "ItemMasters_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id);


--
-- Name: PurchaseOrderItems PurchaseOrderItems_PurchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrderItems"
    ADD CONSTRAINT "PurchaseOrderItems_PurchaseOrderId_fkey" FOREIGN KEY ("PurchaseOrderId") REFERENCES public."PurchaseOrders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrderItems PurchaseOrderItems_itemNumber_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrderItems"
    ADD CONSTRAINT "PurchaseOrderItems_itemNumber_fkey" FOREIGN KEY ("itemNumber") REFERENCES public."ItemMasters"("itemNumber") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrderItems PurchaseOrderItems_prItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrderItems"
    ADD CONSTRAINT "PurchaseOrderItems_prItemId_fkey" FOREIGN KEY ("prItemId") REFERENCES public."PurchaseRequisitionItems"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrderItems PurchaseOrderItems_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrderItems"
    ADD CONSTRAINT "PurchaseOrderItems_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public."PurchaseOrders"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseOrderItems PurchaseOrderItems_rfqItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrderItems"
    ADD CONSTRAINT "PurchaseOrderItems_rfqItemId_fkey" FOREIGN KEY ("rfqItemId") REFERENCES public."RfqItems"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrders PurchaseOrders_ContractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_ContractId_fkey" FOREIGN KEY ("ContractId") REFERENCES public."Contracts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrders PurchaseOrders_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseOrders PurchaseOrders_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public."Contracts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrders PurchaseOrders_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseOrders PurchaseOrders_currentApproverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_currentApproverId_fkey" FOREIGN KEY ("currentApproverId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrders PurchaseOrders_requestForQuotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_requestForQuotationId_fkey" FOREIGN KEY ("requestForQuotationId") REFERENCES public."RequestForQuotations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrders PurchaseOrders_requestorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseOrders PurchaseOrders_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Suppliers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseOrders PurchaseOrders_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseOrders"
    ADD CONSTRAINT "PurchaseOrders_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public."Contracts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_inventoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES public."Inventories"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_itemMasterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_itemMasterId_fkey" FOREIGN KEY ("itemMasterId") REFERENCES public."ItemMasters"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_itemNumber_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_itemNumber_fkey" FOREIGN KEY ("itemNumber") REFERENCES public."ItemMasters"("itemNumber") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_purchaseRequisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_purchaseRequisitionId_fkey" FOREIGN KEY ("purchaseRequisitionId") REFERENCES public."PurchaseRequisitions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseRequisitionItems PurchaseRequisitionItems_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitionItems"
    ADD CONSTRAINT "PurchaseRequisitionItems_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Suppliers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequisitions PurchaseRequisitions_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseRequisitions PurchaseRequisitions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseRequisitions PurchaseRequisitions_currentApproverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_currentApproverId_fkey" FOREIGN KEY ("currentApproverId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequisitions PurchaseRequisitions_requestorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PurchaseRequisitions PurchaseRequisitions_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT "PurchaseRequisitions_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: RejectionNotifications RejectionNotifications_rejectedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RejectionNotifications"
    ADD CONSTRAINT "RejectionNotifications_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES public."Users"(id);


--
-- Name: ReorderRequestItems ReorderRequestItems_inventoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequestItems"
    ADD CONSTRAINT "ReorderRequestItems_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES public."Inventories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReorderRequestItems ReorderRequestItems_reorderRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequestItems"
    ADD CONSTRAINT "ReorderRequestItems_reorderRequestId_fkey" FOREIGN KEY ("reorderRequestId") REFERENCES public."ReorderRequests"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReorderRequests ReorderRequests_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReorderRequests ReorderRequests_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReorderRequests ReorderRequests_storageLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReorderRequests"
    ADD CONSTRAINT "ReorderRequests_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES public."StorageLocations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RequestForQuotations RequestForQuotations_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: RequestForQuotations RequestForQuotations_purchaseRequisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_purchaseRequisitionId_fkey" FOREIGN KEY ("purchaseRequisitionId") REFERENCES public."PurchaseRequisitions"(id) ON UPDATE CASCADE;


--
-- Name: RequestForQuotations RequestForQuotations_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestForQuotations"
    ADD CONSTRAINT "RequestForQuotations_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: RfqItems RfqItems_RequestForQuotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqItems"
    ADD CONSTRAINT "RfqItems_RequestForQuotationId_fkey" FOREIGN KEY ("RequestForQuotationId") REFERENCES public."RequestForQuotations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RfqItems RfqItems_itemNumber_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqItems"
    ADD CONSTRAINT "RfqItems_itemNumber_fkey" FOREIGN KEY ("itemNumber") REFERENCES public."ItemMasters"("itemNumber") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RfqItems RfqItems_purchaseRequisitionItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqItems"
    ADD CONSTRAINT "RfqItems_purchaseRequisitionItemId_fkey" FOREIGN KEY ("purchaseRequisitionItemId") REFERENCES public."PurchaseRequisitionItems"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RfqItems RfqItems_requestForQuotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqItems"
    ADD CONSTRAINT "RfqItems_requestForQuotationId_fkey" FOREIGN KEY ("requestForQuotationId") REFERENCES public."RequestForQuotations"(id) ON UPDATE CASCADE;


--
-- Name: RfqQuoteItems RfqQuoteItems_RfqItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqQuoteItems"
    ADD CONSTRAINT "RfqQuoteItems_RfqItemId_fkey" FOREIGN KEY ("RfqItemId") REFERENCES public."RfqItems"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RfqQuoteItems RfqQuoteItems_RfqSupplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqQuoteItems"
    ADD CONSTRAINT "RfqQuoteItems_RfqSupplierId_fkey" FOREIGN KEY ("RfqSupplierId") REFERENCES public."RfqSuppliers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RfqQuoteItems RfqQuoteItems_rfqItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqQuoteItems"
    ADD CONSTRAINT "RfqQuoteItems_rfqItemId_fkey" FOREIGN KEY ("rfqItemId") REFERENCES public."RfqItems"(id) ON UPDATE CASCADE;


--
-- Name: RfqQuoteItems RfqQuoteItems_rfqSupplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqQuoteItems"
    ADD CONSTRAINT "RfqQuoteItems_rfqSupplierId_fkey" FOREIGN KEY ("rfqSupplierId") REFERENCES public."RfqSuppliers"(id) ON UPDATE CASCADE;


--
-- Name: RfqSuppliers RfqSuppliers_RequestForQuotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqSuppliers"
    ADD CONSTRAINT "RfqSuppliers_RequestForQuotationId_fkey" FOREIGN KEY ("RequestForQuotationId") REFERENCES public."RequestForQuotations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RfqSuppliers RfqSuppliers_requestForQuotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqSuppliers"
    ADD CONSTRAINT "RfqSuppliers_requestForQuotationId_fkey" FOREIGN KEY ("requestForQuotationId") REFERENCES public."RequestForQuotations"(id) ON UPDATE CASCADE;


--
-- Name: RfqSuppliers RfqSuppliers_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RfqSuppliers"
    ADD CONSTRAINT "RfqSuppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Suppliers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StorageLocations StorageLocations_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageLocations"
    ADD CONSTRAINT "StorageLocations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Suppliers Suppliers_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."Users"(id);


--
-- Name: Suppliers Suppliers_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Suppliers Suppliers_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: TransactionItems TransactionItems_destinationBinId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_destinationBinId_fkey" FOREIGN KEY ("destinationBinId") REFERENCES public."BinLocations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionItems TransactionItems_destinationLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES public."StorageLocations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionItems TransactionItems_inventoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES public."Inventories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionItems TransactionItems_sourceBinId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_sourceBinId_fkey" FOREIGN KEY ("sourceBinId") REFERENCES public."BinLocations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionItems TransactionItems_sourceLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES public."StorageLocations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionItems TransactionItems_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public."Transactions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_completedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notifications fk_notification_action_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT fk_notification_action_user FOREIGN KEY ("actionById") REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: PurchaseRequisitions fk_purchase_requisition_contract; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT fk_purchase_requisition_contract FOREIGN KEY ("contractId") REFERENCES public."Contracts"(id) ON DELETE SET NULL;


--
-- Name: PurchaseRequisitions fk_purchase_requisitions_contract; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseRequisitions"
    ADD CONSTRAINT fk_purchase_requisitions_contract FOREIGN KEY ("contractId") REFERENCES public."Contracts"(id) ON DELETE SET NULL;


--
-- Name: user_unspsc_favorites user_unspsc_favorites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_unspsc_favorites
    ADD CONSTRAINT "user_unspsc_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: user_unspsc_hierarchy user_unspsc_hierarchy_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_unspsc_hierarchy
    ADD CONSTRAINT "user_unspsc_hierarchy_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

