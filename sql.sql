--
-- PostgreSQL database dump
--

-- Dumped from database version 10.16
-- Dumped by pg_dump version 10.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- Name: serial; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.serial
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.serial OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer DEFAULT nextval('public.serial'::regclass) NOT NULL,
    username character varying(50) DEFAULT NULL::character varying NOT NULL,
    password character varying(255) NOT NULL,
    "registerDate" date NOT NULL,
    "registerTime" time without time zone NOT NULL,
    "lastDate" date,
    "lastTime" time without time zone,
    role smallint DEFAULT 2 NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: COLUMN "user".id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user".id IS '用户id';


--
-- Name: COLUMN "user".username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user".username IS '用户名';


--
-- Name: COLUMN "user".password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user".password IS '用户密码';


--
-- Name: COLUMN "user"."registerDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user"."registerDate" IS '注册日期';


--
-- Name: COLUMN "user"."registerTime"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user"."registerTime" IS '注册时间';


--
-- Name: COLUMN "user"."lastDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user"."lastDate" IS '最后登录日期';


--
-- Name: COLUMN "user"."lastTime"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user"."lastTime" IS '最后登录时间';


--
-- Name: COLUMN "user".role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."user".role IS '管理角色';


--
-- Name: weixin_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weixin_user (
    id integer DEFAULT nextval('public.serial'::regclass) NOT NULL,
    openid character varying(255) NOT NULL,
    "userInfo" character varying(800),
    "createDate" date,
    "createTime" time without time zone,
    unionid character varying(100),
    subscribe smallint
);


ALTER TABLE public.weixin_user OWNER TO postgres;

--
-- Name: COLUMN weixin_user.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user.id IS '微信用户id';


--
-- Name: COLUMN weixin_user.openid; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user.openid IS '微信openid';


--
-- Name: COLUMN weixin_user."userInfo"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user."userInfo" IS '微信用户信息';


--
-- Name: COLUMN weixin_user."createDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user."createDate" IS '关注日期';


--
-- Name: COLUMN weixin_user."createTime"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user."createTime" IS '关注时间';


--
-- Name: COLUMN weixin_user.unionid; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user.unionid IS '开发平台id';


--
-- Name: COLUMN weixin_user.subscribe; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.weixin_user.subscribe IS '是否关注了公众号';


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, password, "registerDate", "registerTime", "lastDate", "lastTime", role) FROM stdin;
5	123	123	2021-03-23	16:10:21	\N	\N	1
11	555	15de21c670ae7c3f6f3f1f37029303c9	2021-04-13	17:33:56	\N	\N	2
12	666	fae0b27c451c728867a567e8c1bb4e53	2021-04-13	17:34:55	\N	\N	2
9	test123	202cb962ac59075b964b07152d234b70	2021-04-13	17:21:37	\N	\N	2
10	du	550a141f12de6341fba65b0ad0433500	2021-04-13	17:29:27	\N	\N	1
\.


--
-- Data for Name: weixin_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weixin_user (id, openid, "userInfo", "createDate", "createTime", unionid, subscribe) FROM stdin;
7	osxbF6FBz34qXaZR1G2TDu2b-TG8	{"nickname":"y.","sex":1,"language":"zh_CN","city":"汕头","province":"广东","country":"中国","headimgurl":"http://thirdwx.qlogo.cn/mmopen/mficOBicTodKJJdL6wwgfVzzFpm7Hw6um0beNQpPziaq8Ks3GI1qxKnqcpEtRFH4vosprnkzWRWzMuibDO4WUBcxwq04lWrmrcWI/132","subscribe_time":1616853577,"remark":"","groupid":0,"tagid_list":[],"subscribe_scene":"ADD_SCENE_QR_CODE","qr_scene":0,"qr_scene_str":""}	2021-04-06	15:33:47	\N	1
8	osxbF6Lunqxg5-9DhZHkZeRNNgGg	{"nickname":"杜","sex":0,"language":"zh_CN","city":"","province":"","country":"","headimgurl":"","subscribe_time":1617763233,"remark":"","groupid":0,"tagid_list":[],"subscribe_scene":"ADD_SCENE_QR_CODE","qr_scene":0,"qr_scene_str":""}	2021-04-07	10:45:29	\N	1
\.


--
-- Name: serial; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.serial', 13, true);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: weixin_user weixin_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weixin_user
    ADD CONSTRAINT weixin_user_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

