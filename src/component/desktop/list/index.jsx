// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, Table} from 'antd';
import {getRecords} from '../../../api/list';
import Pagination from '../../common/Pagination';
import FilterList from './filter';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import FormRegister from './formRegister';
import {ID_APP_CUSTOMER} from '../../common/const';
import MainLayout from '../../layout/main';
import CardComponent from '../common/card/CardComponent';
import Cookie from 'js-cookie';
import {formatMoney} from '../../../utils/common';

const DEFAULT_PAGE_SIZE = 10;

const FORMAT_DATE = 'YYYY/MM/DD';

const idApp = kintone.app.getId();

const staffIdLogin = Cookie.get('staffIdLogin');

const FORMAT_DATETIME = 'YYYY/MM/DD HH:mm';

export default function TableList({isAdmin, event, isMobile}) {

  return (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
      <CardComponent title={'給与計算'}>
        <FormRegister isAdmin={isAdmin} event={event} isMobile={isMobile}/>
      </CardComponent>
    </MainLayout>
  );
}