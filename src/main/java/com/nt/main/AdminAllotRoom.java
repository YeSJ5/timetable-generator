package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/allot")
public class AdminAllotRoom extends HttpServlet{
		@Override
		public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
			PrintWriter pw= res.getWriter();
			res.setContentType("text/html");
			String regno=req.getParameter("regno").toUpperCase();
			String roomno=req.getParameter("roomno").toUpperCase();
			try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
			PreparedStatement ps=con.prepareStatement("SELECT YEAR FROM REGISTRATION WHERE REG_NO=?" );
			ps.setString(1, regno);
			ResultSet rs=ps.executeQuery();
			String year=null;
			if(rs.next()) {
				 year=rs.getString(1);
			}
			
			PreparedStatement ps1=con.prepareStatement("INSERT INTO STUDENTS VALUES(?,?,?)");
			ps1.setString(1, regno);
			ps1.setString(2, roomno);
			ps1.setString(3, year);
			System.out.println(regno);
			System.out.println(roomno);
			System.out.println(year);
			int count=ps1.executeUpdate();
			int count1=0;
			if(count==1) {
				PreparedStatement ps2=con.prepareStatement("DELETE FROM REGISTRATION WHERE REG_NO='"+regno+"'");
				 count1=ps2.executeUpdate();
			}
			if((count+count1)==2) {
				res.sendRedirect("allot.html");
			}
			
			}catch(Exception e) {
				e.printStackTrace();
			}
}
		
		@Override
		public  void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req,res);
		}
}
