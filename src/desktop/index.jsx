// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import $ from 'jquery';
import TableList from '../component/desktop/list';
import Detail from '../component/desktop/detail';
import FormRegister from '../component/desktop/list/formRegister';
import Cookie from 'js-cookie';
import {ID_APP_STAFF} from '../component/common/const';
import {logout} from '../utils/common';

(PLUGIN_ID => {

  const userLogin = kintone.getLoginUser();

  const staffIdLogin = Cookie.get('staffIdLogin');
  const userISK = Cookie.get('userISK');
  const passISK = Cookie.get('passISK');
  const userLoginCookie = Cookie.get('userLogin');

  let body = {
    'app': ID_APP_STAFF,
    'query': `username = "${userISK}" and password = "${passISK}" order by $id asc limit 100 offset 0`,
    fields: ['$id']
  };

  let bodyAdmin = {
    'code': 'Administrators',
    'offset': 0,
    'size': 100
  };

  const routerPage = async () => {
    let dataFetch;
    try {
      dataFetch = await Promise.all([
        await kintone.api(kintone.api.url('/v1/group/users', true), 'GET', bodyAdmin),
        staffIdLogin && await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body)
      ]);

    } catch (e) {
      logout();
    }
    const [admin, record] = dataFetch;

    const idsAdmin = admin.users.map(val => val.id);
    const checkAdmin = idsAdmin.includes(userLogin.id);

    let data = record?.records;

    let checkLogin = data && data.length && userLogin.email === userLoginCookie;

    return {
      check: checkLogin,
      isAdmin: checkAdmin
    };
  };

  kintone.events.on(['app.record.index.show'], async (event) => {
    let data = await routerPage();
    if (data.check) {
      render(<TableList
        isAdmin={data.isAdmin}
        event={event.records}
      />, document.getElementById('root'));
    } else {
      logout();
    }
  });

  kintone.events.on(['app.record.create.show'], async (event) => {
    let data = await routerPage();
    if (data.check) {
      $('#appForm-gaia').remove()
      render(<FormRegister event={event} isAdmin={data.isAdmin}/>, document.getElementById('record-gaia'));
    } else {
      logout();
    }
  });

  kintone.events.on(['app.record.edit.show'], async (event) => {
    let data = await routerPage();
    if (data.check) {
      $('#appForm-gaia').remove()
      render( <FormRegister event={event} isAdmin={data.isAdmin} type={'edit'}/>, document.getElementById('record-gaia'))
    } else {
      logout();
    }
  });

  kintone.events.on(['app.record.detail.show'], async (event) => {
    let data = await routerPage();
    if(!data.isAdmin && staffIdLogin !== event.record.id_staff.value) {
      window.location.href = `${window.location.origin}/k/${kintone.app.getId()}`
    }
    else {
      if (data.check) {
        render(<Detail  isAdmin={data.isAdmin} record={event.record} />, document.getElementById('record-gaia'));
      } else {
        logout();
      }
    }

  });

  kintone.events.on(['mobile.app.record.index.show'], async (event) => {
    let data = await routerPage();
    if (data.check) {
      render(<TableList
        isAdmin={data.isAdmin}
        event={event.records}
        isMobile={true}
      />, document.getElementById('root'));
    } else {
      logout();
    }
  });

  kintone.events.on(['mobile.app.record.create.show'], async (event) => {
    let data = await routerPage();
    if (data.check) {
      $('#appForm-gaia').remove()
      render(<FormRegister event={event} isAdmin={data.isAdmin}/>, document.getElementById('record-gaia'));
    } else {
      logout();
    }
  });

  kintone.events.on(['mobile.app.record.edit.show'], async (event) => {
    let data = await routerPage();
    if (data.check) {
      $('#appForm-gaia').remove()
      render( <FormRegister event={event} isAdmin={data.isAdmin} type={'edit'}/>, document.getElementById('record-gaia'))
    } else {
      logout();
    }
  });

  kintone.events.on(['mobile.app.record.detail.show'], async (event) => {
    let data = await routerPage();
    if(!data.isAdmin && staffIdLogin !== event.record.id_staff.value) {
      window.location.href = `${window.location.origin}/k/${kintone.app.getId()}`
    }
    else {
      if (data.check) {
        render(<Detail  isAdmin={data.isAdmin} record={event.record} />, document.getElementById('record-gaia'));
      } else {
        logout();
      }
    }

  });

})(kintone.$PLUGIN_ID);